import { RedlockConfig } from "./redlock.type";

/** Injection token for the Redlock configuration object. */
export const REDLOCK_CONFIG = "token:redlock-config";

/** Injection token for the `RedlockService` instance (alternative to class-based injection). */
export const REDLOCK_SERVICE = "token:redlock-service";

/** Injection token for the set of Redis clients used by Redlock. */
export const REDLOCK_REDIS_CLIENTS = "token:redlock-redis";

/**
 * Default Redlock algorithm configuration values.
 *
 * - `driftFactor`: 1% clock drift allowance
 * - `retryCount`: 3 attempts before giving up
 * - `retryDelay`: 200ms between retries
 * - `retryJitter`: ±100ms random jitter on retry delay
 * - `automaticExtensionThreshold`: extend lock 500ms before expiration
 */
export const defaultRedlockConfig: Readonly<RedlockConfig> = {
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 100,
  automaticExtensionThreshold: 500,
};
