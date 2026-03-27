import { IDistributedLockService } from "../interfaces";

/**
 * A map of named distributed lock service instances.
 * Keys are provider names (e.g. `"default"`, `"redis"`), values are lock service implementations.
 */
export type DistributedLockServices = Record<string, IDistributedLockService>;

/**
 * Options for the `@DistributionLock()` decorator.
 *
 * @property key      - The lock key, either a static string or a function that derives the key from method arguments
 * @property ttl      - Lock time-to-live in milliseconds
 * @property provider - Optional name of the lock provider to use (defaults to `"default"`)
 * @property logging  - Whether to enable lifecycle logging for this lock
 */
export type DistributionLockOptions = {
  key: string | ((args: any[]) => string);
  ttl: number;
  provider?: string;
  logging?: boolean;
};

/**
 * Result returned after releasing a distributed lock.
 *
 * @property attempts - Array of promises representing each unlock attempt per resource
 * @property start    - Timestamp (ms) when the release started
 */
export type ExecutionResult = {
  attempts: ReadonlyArray<Promise<any>>;
  start: number;
};

/**
 * A handle representing an acquired distributed lock.
 *
 * @property resources  - The resource keys that are locked
 * @property expiration - Timestamp (ms) when the lock expires
 */
export type DistributedLock = {
  resources: string[];
  expiration: number;
  /** Release this lock and free the underlying resources. */
  release(): Promise<ExecutionResult>;
  /** Extend the lock duration by the given number of milliseconds. */
  extend(duration: number): Promise<DistributedLock>;
};

/**
 * An extended `AbortSignal` that carries additional error information
 * when a lock-protected operation is aborted.
 */
export type DistributedLockAbortSignal = AbortSignal & {
  /** The error that caused the abort, if any. */
  error?: unknown;
};
