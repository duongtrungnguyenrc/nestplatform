import type { RedisClient, RedisConfig } from "@nestplatform/redis";
import type { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";

/**
 * Backward-compatible alias for `RedisClient` from `@nestplatform/redis`.
 *
 * Represents a single Redis node or cluster instance used by the Redlock algorithm.
 */
export type Client = RedisClient;

/**
 * Result of executing a Lua script on a single Redis client.
 *
 * A vote `"for"` indicates the script succeeded on that client;
 * a vote `"against"` indicates the script failed.
 */
export type ClientExecutionResult =
  | {
      client: Client;
      vote: "for";
      value: number;
    }
  | {
      client: Client;
      vote: "against";
      error: Error;
    };

/**
 * Aggregated voting statistics from a single execution attempt across all Redis clients.
 */
export type ExecutionStats = {
  /** Total number of Redis clients participating. */
  readonly membershipSize: number;
  /** Minimum number of votes needed for quorum (⌊n/2⌋ + 1). */
  readonly quorumSize: number;
  /** Clients that voted in favor (script succeeded). */
  readonly votesFor: Set<Client>;
  /** Clients that voted against, mapped to their error. */
  readonly votesAgainst: Map<Client, Error>;
};

/**
 * Final result of a distributed lock operation.
 *
 * Contains all execution attempt statistics and the wall-clock timestamp when the operation started.
 * Because the result of an attempt can sometimes be determined before all requests are finished,
 * each attempt contains a Promise that will resolve `ExecutionStats` once all requests are finished.
 */
export type ExecutionResult = {
  /** Promise for each attempt's voting statistics. */
  attempts: ReadonlyArray<Promise<ExecutionStats>>;
  /** Timestamp (ms) when the successful attempt began. */
  start: number;
};

/**
 * Configuration options for the Redlock algorithm.
 */
export type RedlockConfig = {
  /** Clock drift factor (default: `0.01`). Accounts for clock skew between Redis nodes. */
  readonly driftFactor: number;
  /** Maximum number of retry attempts (default: `3`). Use `-1` for infinite retries. */
  readonly retryCount: number;
  /** Delay in ms between retry attempts (default: `200`). */
  readonly retryDelay: number;
  /** Random jitter in ms added/subtracted from retry delay (default: `100`). */
  readonly retryJitter: number;
  /** Time in ms before lock expiration to trigger automatic extension (default: `500`). */
  readonly automaticExtensionThreshold: number;
  /** Enable lifecycle logging. */
  readonly logging?: boolean;
};

/**
 * Synchronous module configuration for `RedlockModule.register()`.
 *
 * Accepts one or more Redis connection configs that will be used to create the Redis clients internally.
 */
export type RedlockModuleConfig = Omit<ModuleConfigBase, "global"> &
  Partial<RedlockConfig> & {
    /** Redis connection config(s). Multiple configs enable the Redlock quorum algorithm. */
    redisClients: RedisConfig | RedisConfig[];
    /** Enable lifecycle logging. */
    logging?: boolean;
  };

/**
 * Asynchronous module configuration for `RedlockModule.registerAsync()`.
 *
 * The factory function should return pre-created Redis client instances.
 */
export type RedlockModuleConfigAsync = Omit<ModuleConfigBase, "global"> &
  ModuleConfigAsync<
    Partial<RedlockConfig> & {
      /** Pre-created Redis client instances for the Redlock algorithm. */
      redisClients: Client[];
    }
  >;

/**
 * Extended `AbortSignal` used by `withLock` to signal that lock extension has failed
 * and the handler should abort its operation.
 */
export type RedlockAbortSignal = AbortSignal & { error?: Error };
