import { DistributedLock } from "@nestplatform/distribution-lock";

import { ExecutionResult, ExecutionStats } from "./redlock.type";
import { RedlockService } from "./redlock.service";

/**
 * Represents an acquired distributed lock.
 *
 * Returned when a resource is successfully locked via `RedlockService.acquire()` or `withLock()`.
 * Provides convenience methods to `release` and `extend` the lock without referencing
 * the parent `RedlockService` directly.
 *
 * @example
 * ```typescript
 * const lock = await redlockService.acquire(['resource:123'], 5000);
 * try {
 *   // ... perform exclusive work ...
 * } finally {
 *   await lock.release();
 * }
 * ```
 */
export class RedLock implements DistributedLock {
  constructor(
    /** The parent `RedlockService` that created this lock. */
    public readonly redlock: RedlockService,
    /** Resource keys that are locked. */
    public readonly resources: string[],
    /** Unique random value identifying this lock instance. */
    public readonly value: string,
    /** Execution statistics from the acquisition attempts. */
    public readonly _attempts: ReadonlyArray<Promise<ExecutionStats>>,
    /** Timestamp (ms) when this lock expires. Set to `0` when released or invalidated. */
    public expiration: number,
  ) {}

  /**
   * Release this lock from all Redis nodes.
   *
   * @returns Execution result with release attempt statistics.
   */
  async release(): Promise<ExecutionResult> {
    return this.redlock.release(this);
  }

  /**
   * Extend this lock's TTL by the specified duration.
   *
   * @param duration - Additional time-to-live in milliseconds.
   * @returns A new `RedLock` instance with updated expiration.
   */
  async extend(duration: number): Promise<RedLock> {
    return this.redlock.extend(this, duration);
  }
}
