import { Inject, Injectable } from "@nestjs/common";
import { Pool, PoolClient } from "pg";

import {
  DistributedLockAbortSignal,
  DistributedLock,
  ExecutionResult,
  IDistributedLockService,
  ResourceLockedException,
  LockExecutionException,
} from "@nestplatform/distribution-lock";

import { PG_ADVISORY_POOL } from "./pglock.constant";
import { hashKey, PgLock } from "./pglock.util";
import { EventEmitter } from "events";

/**
 * Distributed lock service implementation using PostgreSQL session-level advisory locks.
 *
 * Advisory locks are application-level locks managed by PostgreSQL that do not
 * block table access. They are ideal for coordinating exclusive access to
 * shared resources across distributed NestJS instances connected to the same database.
 *
 * Lock keys are hashed to 64-bit integers using SHA-256 as required by
 * `pg_try_advisory_lock()`.
 *
 * @example
 * ```typescript
 * const pgLockService = new PgLockService(pool);
 * await pgLockService.withLock(['order:123'], 5000, async (signal) => {
 *   // Only one process can execute this at a time
 *   await processOrder(123);
 * });
 * ```
 */
@Injectable()
export class PgLockService implements IDistributedLockService {
  constructor(@Inject(PG_ADVISORY_POOL) private readonly pool: Pool) {}

  /**
   * Acquire advisory locks on the given resources.
   *
   * Uses `pg_try_advisory_lock()` for non-blocking lock acquisition.
   * If any resource is already locked, throws `ResourceLockedException`.
   *
   * @param resources - List of resource keys to lock
   * @param duration  - Lock TTL in milliseconds (used for expiration tracking)
   * @returns A `PgLock` handle for the acquired lock
   * @throws {ResourceLockedException} If any resource is already locked
   * @throws {LockExecutionException} If a database error occurs during acquisition
   */
  async acquire(resources: string[], duration: number): Promise<DistributedLock> {
    const client: PoolClient = await this.pool.connect();

    try {
      for (const r of resources) {
        const { rows } = await client.query("SELECT pg_try_advisory_lock($1) AS locked", [hashKey(r)]);

        if (!rows[0].locked) throw new ResourceLockedException("Resource already locked.");
      }

      return new PgLock(client, resources, Date.now() + duration);
    } catch (e) {
      client.release();

      if (e instanceof ResourceLockedException) {
        throw e;
      }

      throw new LockExecutionException(e);
    }
  }

  /**
   * Extend the duration of an existing lock.
   *
   * @param lock     - The lock handle to extend
   * @param duration - Additional duration in milliseconds
   * @returns A new lock handle with the extended expiration
   */
  async extend(lock: DistributedLock, duration: number): Promise<DistributedLock> {
    return lock.extend(duration);
  }

  /**
   * Release a previously acquired advisory lock.
   *
   * @param lock - The lock handle to release
   * @returns The execution result containing release attempts
   */
  async release(lock: DistributedLock): Promise<ExecutionResult> {
    return lock.release();
  }

  /**
   * Execute a handler function while holding advisory locks on the given resources.
   *
   * Acquires the locks, runs the handler, and releases all locks automatically
   * when the handler completes or throws. An optional event handler receives
   * an `EventEmitter` that emits `acquired`, `released`, and `aborted` events.
   *
   * @param resources    - List of resource keys to lock
   * @param duration     - Lock TTL in milliseconds
   * @param handler      - Async function to execute while the lock is held
   * @param eventHandler - Optional callback to subscribe to lock lifecycle events
   * @returns The result of the handler function
   * @throws {ResourceLockedException} If any resource is already locked
   */
  async withLock<T>(
    resources: string[],
    duration: number,
    handler: (signal: DistributedLockAbortSignal) => Promise<T>,
    eventHandler?: (emitter: EventEmitter) => void,
  ): Promise<T> {
    const emitter = new EventEmitter();
    eventHandler?.(emitter);

    const controller = new AbortController();
    const lock: DistributedLock = await this.acquire(resources, duration);

    emitter.emit("acquired", lock);

    try {
      return await handler(controller.signal as DistributedLockAbortSignal);
    } catch (e) {
      emitter.emit("aborted");

      (controller.signal as DistributedLockAbortSignal).error = e;

      throw e;
    } finally {
      emitter.emit("released");
      await lock.release();
    }
  }
}
