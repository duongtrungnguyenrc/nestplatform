import { EventEmitter } from "events";

import type { DistributedLock, DistributedLockAbortSignal, ExecutionResult } from "../types";

/**
 * Plugin interface for distributed lock service implementations.
 *
 * Each implementation is responsible for managing the lifecycle of distributed locks
 * using its specific backend (Redis, PostgreSQL Advisory Locks, etc.).
 *
 * The service handles:
 * 1. Acquiring locks on named resources with a TTL
 * 2. Extending the duration of existing locks
 * 3. Releasing locks when work is complete
 * 4. Convenience method for executing work within a lock scope
 */
export interface IDistributedLockService {
  /**
   * Acquire a distributed lock on the given resources.
   *
   * @param resources - List of resource keys to lock
   * @param duration  - Lock time-to-live in milliseconds
   * @param options   - Additional backend-specific options
   * @returns A handle representing the acquired lock
   * @throws {ResourceLockedException} If the resource is already locked
   */
  acquire(resources: string[], duration: number, options?: any): Promise<DistributedLock>;

  /**
   * Extend the duration of an existing lock.
   *
   * @param handle   - The lock handle to extend
   * @param duration - Additional duration in milliseconds
   * @param options  - Additional backend-specific options
   * @returns A new lock handle with the extended expiration
   */
  extend(handle: DistributedLock, duration: number, options?: any): Promise<DistributedLock>;

  /**
   * Release a previously acquired lock.
   *
   * @param handle  - The lock handle to release
   * @param options - Additional backend-specific options
   * @returns The execution result containing release attempts
   */
  release(handle: DistributedLock, options?: any): Promise<ExecutionResult>;

  /**
   * Execute a handler function while holding a distributed lock.
   *
   * Acquires the lock, runs the handler, and releases the lock automatically
   * when the handler completes (or throws). An optional event handler receives
   * an `EventEmitter` that emits `acquired`, `released`, and `aborted` events.
   *
   * @param resources    - List of resource keys to lock
   * @param duration     - Lock time-to-live in milliseconds
   * @param handler      - Async function to execute while the lock is held
   * @param eventHandler - Optional callback to subscribe to lock lifecycle events
   * @param options      - Additional backend-specific options
   * @returns The result of the handler function
   *
   * @example
   * ```typescript
   * await lockService.withLock(
   *   ['order:123'],
   *   5000,
   *   async (signal) => {
   *     // Perform work while lock is held
   *     return await processOrder(123);
   *   },
   * );
   * ```
   */
  withLock<T>(
    resources: string[],
    duration: number,
    handler: (signal: DistributedLockAbortSignal) => Promise<T>,
    eventHandler?: (emitter: EventEmitter) => void,
    options?: any,
  ): Promise<T>;
}
