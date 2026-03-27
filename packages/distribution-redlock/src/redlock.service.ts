import { IDistributedLockService, LockExecutionException, ResourceLockedException } from "@nestplatform/distribution-lock";
import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import type { RedisKey, RedisValue } from "@nestplatform/redis";

import { EventEmitter } from "events";

import { Client, ClientExecutionResult, ExecutionResult, ExecutionStats, RedlockAbortSignal, RedlockConfig } from "./redlock.type";
import { ACQUIRE_SCRIPT, EXTEND_SCRIPT, RELEASE_SCRIPT } from "./redlock.scripts";
import { REDLOCK_REDIS_CLIENTS, REDLOCK_CONFIG } from "./redlock.constant";
import { RedLock } from "./redlock.util";

/**
 * Distributed lock service implementing the Redlock algorithm.
 *
 * Manages quorum-based lock acquisition, extension, and release across multiple
 * Redis instances. Extends `EventEmitter` and emits `"error"` events for
 * monitoring non-fatal failures on minority nodes.
 *
 * Requires at least one Redis client. For true distributed locking,
 * use 3+ independent Redis nodes.
 *
 * @see https://redis.io/docs/manual/patterns/distributed-locks/
 */
@Injectable()
export class RedlockService extends EventEmitter implements IDistributedLockService {
  private readonly scripts: {
    readonly acquireScript: { value: string; hash: string };
    readonly extendScript: { value: string; hash: string };
    readonly releaseScript: { value: string; hash: string };
  };

  private readonly clients: Set<Client>;

  public constructor(
    @Inject(REDLOCK_REDIS_CLIENTS) clients: Client[],
    @Inject(REDLOCK_CONFIG) private readonly config: RedlockConfig,
  ) {
    super();

    // Prevent crashes on error events.
    this.on("error", () => {
      // Because redlock is designed for high availability, it does not care if
      // a minority of redis instances/clusters fail at an operation.
      //
      // However, it can be helpful to monitor and log such cases. Redlock emits
      // an "error" event whenever it encounters an error, even if the error is
      // ignored in its normal operation.
      //
      // This function serves to prevent node's default behavior of crashing
      // when an "error" event is emitted in the absence of listeners.
    });

    // Create a new Set of clients, to ensure no accidental mutation.
    this.clients = new Set(clients);
    if (this.clients.size === 0) {
      throw new Error("Redlock must be instantiated with at least one redis client.");
    }

    this.scripts = {
      acquireScript: {
        value: ACQUIRE_SCRIPT,
        hash: this._hash(ACQUIRE_SCRIPT),
      },
      extendScript: {
        value: EXTEND_SCRIPT,
        hash: this._hash(EXTEND_SCRIPT),
      },
      releaseScript: {
        value: RELEASE_SCRIPT,
        hash: this._hash(RELEASE_SCRIPT),
      },
    };
  }

  /**
   * Generate a sha1 hash compatible with redis evalsha.
   */
  private _hash(value: string): string {
    return createHash("sha1").update(value).digest("hex");
  }

  /**
   * Generate a cryptographically random string.
   */
  private _random(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Acquire a distributed lock on the given resources.
   *
   * Executes the acquire Lua script on all Redis clients and waits for a quorum.
   * On failure, automatically cleans up any partial locks.
   *
   * @param resources - Resource keys to lock (e.g., `['order:123']`).
   * @param duration  - Lock TTL in milliseconds (must be an integer).
   * @param config    - Optional overrides for retry/drift settings.
   * @returns A `RedLock` handle representing the acquired lock.
   * @throws {LockExecutionException} If quorum cannot be achieved.
   */
  public async acquire(resources: string[], duration: number, config?: Partial<RedlockConfig>): Promise<RedLock> {
    if (Math.floor(duration) !== duration) {
      throw new Error("Duration must be an integer value in milliseconds.");
    }

    const value: string = this._random();

    try {
      const { attempts, start } = await this._execute(this.scripts.acquireScript, resources, [value, duration], config);

      // Add 2 milliseconds to the drift to account for Redis expires precision,
      // which is 1 ms, plus the configured allowable drift factor.
      const drift: number = Math.round((config?.driftFactor ?? this.config.driftFactor) * duration) + 2;

      return new RedLock(this, resources, value, attempts, start + duration - drift);
    } catch (error) {
      // If there was an error acquiring the lock, release any partial lock
      // state that may exist on a minority of clients.
      await this._execute(this.scripts.releaseScript, resources, [value], {
        retryCount: 0,
      }).catch(() => {
        // Any error here will be ignored.
      });

      throw error;
    }
  }

  /**
   * Release a previously acquired lock from all Redis nodes.
   *
   * Immediately invalidates the lock's expiration and runs the release script.
   * It is safe to re-attempt a release or ignore errors, as the lock will
   * automatically expire after its TTL.
   *
   * @param lock   - The `RedLock` handle to release.
   * @param config - Optional overrides for retry settings.
   * @returns Execution result with release attempt statistics.
   */
  public async release(lock: RedLock, config?: Partial<RedlockConfig>): Promise<ExecutionResult> {
    // Immediately invalidate the lock.
    lock.expiration = 0;

    // Attempt to release the lock.
    return this._execute(this.scripts.releaseScript, lock.resources, [lock.value], config);
  }

  /**
   * Extend the TTL of an existing lock.
   *
   * Invalidates the original lock handle and returns a new one with an updated expiration.
   *
   * @param existing - The current `RedLock` handle to extend.
   * @param duration - Additional TTL in milliseconds (must be an integer).
   * @param config   - Optional overrides for retry/drift settings.
   * @returns A new `RedLock` handle with the extended expiration.
   * @throws {LockExecutionException} If the lock has already expired or quorum fails.
   */
  public async extend(existing: RedLock, duration: number, config?: Partial<RedlockConfig>): Promise<RedLock> {
    if (Math.floor(duration) !== duration) {
      throw new Error("Duration must be an integer value in milliseconds.");
    }

    // The lock has already expired.
    if (existing.expiration < Date.now()) {
      throw new LockExecutionException("Cannot extend an already-expired lock.", []);
    }

    const { attempts, start } = await this._execute(this.scripts.extendScript, existing.resources, [existing.value, duration], config);

    // Invalidate the existing lock.
    existing.expiration = 0;

    // Add 2 milliseconds to the drift to account for Redis expires precision,
    // which is 1 ms, plus the configured allowable drift factor.
    const drift = Math.round((config?.driftFactor ?? this.config.driftFactor) * duration) + 2;

    return new RedLock(this, existing.resources, existing.value, attempts, start + duration - drift);
  }

  /**
   * Execute a handler while holding an auto-extending distributed lock.
   *
   * Acquires the lock, runs the handler, and releases the lock automatically
   * when the handler completes (or throws). The lock is automatically extended
   * before it expires. If extension fails, the `AbortSignal` is triggered.
   *
   * @param resources    - Resource keys to lock.
   * @param duration     - Lock TTL in milliseconds.
   * @param handler      - Async function to execute while the lock is held.
   * @param eventHandler - Optional callback to subscribe to `acquired` / `released` events.
   * @param override     - Optional overrides for Redlock settings.
   * @returns The return value of the handler.
   *
   * @example
   * ```typescript
   * await redlockService.withLock(
   *   ['account:sender', 'account:recipient'],
   *   5000,
   *   async (signal) => {
   *     if (signal.aborted) throw signal.error;
   *     await transferFunds(sender, recipient, amount);
   *   },
   * );
   * ```
   */

  public async withLock<T>(
    resources: string[],
    duration: number,
    handler: (signal: RedlockAbortSignal) => Promise<T>,
    eventHandler?: (emitter: EventEmitter) => void,
    override?: Partial<RedlockConfig>,
  ): Promise<T> {
    if (!Number.isInteger(duration)) {
      throw new Error("Duration must be integer ms");
    }

    const settings = { ...this.config, ...override };

    if (settings.automaticExtensionThreshold >= duration) {
      throw new Error("Invalid extension threshold");
    }

    const emitter = new EventEmitter();
    eventHandler?.(emitter);

    const controller = new AbortController();
    const signal = controller.signal as RedlockAbortSignal;

    let timeout: NodeJS.Timeout | undefined;
    let extending: boolean = false;

    const scheduleExtend = (lock: RedLock): void => {
      const extensionInterval: number = lock.expiration - Date.now() - settings.automaticExtensionThreshold;

      timeout = setTimeout(async (): Promise<void> => {
        if (extending) return;
        extending = true;
        try {
          lock = await lock.extend(duration);
          scheduleExtend(lock);
        } catch (e) {
          controller.abort(e);
        } finally {
          extending = false;
        }
      }, extensionInterval);
    };

    const lock: RedLock = await this.acquire(resources, duration, settings);
    emitter.emit("acquired", lock);
    scheduleExtend(lock);

    try {
      return await handler(signal);
    } finally {
      if (timeout) clearTimeout(timeout);
      await lock.release().catch(() => {});

      emitter.emit("released");
    }
  }

  /**
   * Execute a script on all clients. The resulting promise is resolved or
   * rejected as soon as this quorum is reached; the resolution or rejection
   * will contains a `stats` property that is resolved once all votes are in.
   */
  private async _execute(
    script: { value: string; hash: string },
    keys: RedisKey[],
    args: RedisValue[],
    _config?: Partial<RedlockConfig>,
  ): Promise<ExecutionResult> {
    const config: RedlockConfig = _config
      ? {
          ...this.config,
          ..._config,
        }
      : this.config;

    // For the purpose of easy config serialization, we treat a retryCount of
    // -1 a equivalent to Infinity.
    const maxAttempts = config.retryCount === -1 ? Infinity : config.retryCount + 1;

    const attempts: Promise<ExecutionStats>[] = [];

    while (true) {
      const attempted = await this._attemptOperation(script, keys, args);

      // Infinite retry may result in memory leak when routine() is on hold for long time
      if (maxAttempts !== Infinity) attempts.push(attempted.stats);

      // The operation achieved a quorum in favor.
      if (attempted.vote === "for") {
        return { attempts, start: attempted.start };
      }

      // Wait before reattempting.
      if (attempts.length < maxAttempts) {
        await new Promise((resolve): void => {
          setTimeout(resolve, Math.max(0, config.retryDelay + Math.floor((Math.random() * 2 - 1) * config.retryJitter)), undefined);
        });
      } else {
        if (attempted.vote === "against" && attempted.error && attempted.error instanceof ResourceLockedException) {
          throw attempted.error;
        }

        throw new LockExecutionException("The operation was unable to achieve a quorum during its retry window.", attempts);
      }
    }
  }

  private async _attemptOperation(
    script: { value: string; hash: string },
    keys: RedisKey[],
    args: RedisValue[],
  ): Promise<
    { vote: "for"; stats: Promise<ExecutionStats>; start: number } | { vote: "against"; stats: Promise<ExecutionStats>; start: number; error: Error }
  > {
    const start: number = Date.now();

    return await new Promise((resolve) => {
      const clientResults: Promise<ClientExecutionResult>[] = [];
      for (const client of this.clients) {
        clientResults.push(this._attemptOperationOnClient(client, script, keys, args));
      }

      const stats: ExecutionStats = {
        membershipSize: clientResults.length,
        quorumSize: Math.floor(clientResults.length / 2) + 1,
        votesFor: new Set<Client>(),
        votesAgainst: new Map<Client, Error>(),
      };

      let done: () => void;
      const statsPromise = new Promise<typeof stats>((resolve) => {
        done = () => resolve(stats);
      });

      // This is the expected flow for all successful and unsuccessful requests.
      const onResultResolve = (clientResult: ClientExecutionResult): void => {
        switch (clientResult.vote) {
          case "for":
            stats.votesFor.add(clientResult.client);
            break;
          case "against":
            stats.votesAgainst.set(clientResult.client, clientResult.error);
            break;
        }

        // A quorum has determined a success.
        if (stats.votesFor.size === stats.quorumSize) {
          resolve({
            vote: "for",
            stats: statsPromise,
            start,
          });
        }

        // A quorum has determined a failure.
        if (stats.votesAgainst.size === stats.quorumSize) {
          const errors = Array.from(stats.votesAgainst.values());
          const lastError = errors[errors.length - 1];

          resolve({
            vote: "against",
            stats: statsPromise,
            error: lastError,
            start,
          });
        }

        // All votes are in.
        if (stats.votesFor.size + stats.votesAgainst.size === stats.membershipSize) {
          done();
        }
      };

      // This is unexpected and should crash to prevent undefined behavior.
      const onResultReject = (error: Error): void => {
        throw error;
      };

      for (const result of clientResults) {
        result.then(onResultResolve, onResultReject);
      }
    });
  }

  private async _attemptOperationOnClient(
    client: Client,
    script: { value: string; hash: string },
    keys: RedisKey[],
    args: RedisValue[],
  ): Promise<ClientExecutionResult> {
    try {
      let result: number;
      try {
        // Attempt to evaluate the script by its hash.
        const shaResult = await client.evalsha(script.hash, keys.length, ...keys, ...args);

        if (typeof shaResult !== "number") {
          throw new Error(`Unexpected result of type ${typeof shaResult} returned from redis.`);
        }

        result = shaResult;
      } catch (error) {
        // If the redis server does not already have the script cached,
        // reattempt the request with the script's raw text.
        if (!(error instanceof Error) || !error.message.startsWith("NOSCRIPT")) {
          throw error;
        }

        const rawResult = await client.eval(script.value, keys.length, ...keys, ...args);

        if (typeof rawResult !== "number") {
          throw new Error(`Unexpected result of type ${typeof rawResult} returned from redis.`);
        }

        result = rawResult;
      }

      // One or more of the resources was already locked.
      if (result !== keys.length) {
        throw new ResourceLockedException(`The operation was applied to: ${result} of the ${keys.length} requested resources.`);
      }

      return {
        vote: "for",
        client,
        value: result,
      };
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(`Unexpected type ${typeof error} thrown with value: ${error}`);
      }

      // Emit the error on the redlock instance for observability.
      this.emit("error", error);

      return {
        vote: "against",
        client,
        error,
      };
    }
  }
}
