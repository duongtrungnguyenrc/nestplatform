import { createHash } from "node:crypto";
import { PoolClient } from "pg";

import { DistributedLock, ExecutionResult } from "@nestplatform/distribution-lock";

/**
 * Hash a string key into a 64-bit integer for use with PostgreSQL advisory locks.
 *
 * PostgreSQL's `pg_try_advisory_lock()` requires a `bigint` key.
 * This function uses SHA-256 and reads the first 8 bytes as a signed 64-bit integer.
 *
 * @param value - The string resource key to hash
 * @returns A `bigint` suitable for use as a PostgreSQL advisory lock key
 */
export function hashKey(value: string): bigint {
  const buf = createHash("sha256").update(value).digest();
  return buf.readBigInt64BE(0);
}

/**
 * Concrete `DistributedLock` implementation backed by a PostgreSQL connection.
 *
 * Holds a reference to the `PoolClient` used to acquire the advisory lock.
 * On release, all locks are unlocked via `pg_advisory_unlock()` and the
 * client is returned to the connection pool.
 */
export class PgLock implements DistributedLock {
  constructor(
    private readonly client: PoolClient,
    readonly resources: string[],
    readonly expiration: number,
  ) {}

  /**
   * Release all advisory locks held by this handle and return the client to the pool.
   *
   * @returns The execution result containing individual unlock attempts
   */
  async release(): Promise<ExecutionResult> {
    const attempts = this.resources.map((r) => this.client.query("SELECT pg_advisory_unlock($1)", [hashKey(r)]));

    await Promise.allSettled(attempts);
    this.client.release();

    return { attempts, start: Date.now() };
  }

  /**
   * Extend the lock duration by creating a new `PgLock` with an updated expiration.
   *
   * Note: PostgreSQL advisory locks do not have a built-in TTL, so this simply
   * updates the tracked expiration time on the handle.
   *
   * @param duration - Additional duration in milliseconds
   * @returns A new `PgLock` with the extended expiration
   */
  async extend(duration: number): Promise<DistributedLock> {
    return new PgLock(this.client, this.resources, Date.now() + duration);
  }
}
