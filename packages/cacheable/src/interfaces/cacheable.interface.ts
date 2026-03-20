import Ms from "ms";

/**
 * A key definition that can be either a static value or a function that
 * dynamically generates the key based on the method arguments.
 *
 * @typeParam T - The type of the key value (string, string[], etc.).
 *
 * @example
 * ```typescript
 * // Static key
 * const key: KeyBuilder<string> = 'my-cache-key';
 *
 * // Dynamic key based on arguments
 * const key: KeyBuilder<string> = (id: string) => `user:${id}`;
 * ```
 *
 * @publicApi
 */
export type KeyBuilder<T> = T | ((...args: any[]) => T);

/**
 * TTL (Time To Live) for cache entries. Can be a number (milliseconds) or
 * a human-readable duration string parsed by the `ms` library.
 *
 * @example
 * ```typescript
 * const ttl: CacheTtl = 30000;    // 30 seconds
 * const ttl: CacheTtl = '30s';    // 30 seconds
 * const ttl: CacheTtl = '5m';     // 5 minutes
 * const ttl: CacheTtl = '1h';     // 1 hour
 * ```
 *
 * @publicApi
 */
export type CacheTtl = Ms.StringValue | number;

/**
 * Configuration options for the `@Cacheable` decorator.
 *
 * @publicApi
 */
export type CacheableOptions = {
  /**
   * Custom cache key or key builder function.
   * If not provided, a key is auto-generated from the method name and arguments hash.
   */
  key?: KeyBuilder<string>;

  /**
   * Cache namespace prefix. When set, cache keys are prefixed as `namespace:key`.
   */
  namespace?: KeyBuilder<string>;

  /**
   * Time to live for the cache entry. Accepts milliseconds or a human-readable string.
   */
  ttl?: CacheTtl;
};

/**
 * Configuration options for the `@CacheEvict` decorator.
 *
 * @publicApi
 */
export type CacheEvictOptions = {
  /**
   * The cache key(s) to evict. Can be a single key, multiple keys, or a dynamic builder function.
   */
  key: KeyBuilder<string | string[]>;

  /**
   * Cache namespace prefix to match against when evicting entries.
   */
  namespace?: KeyBuilder<string>;
};

/**
 * Configuration options for the `@CachePut` decorator.
 * Identical to `CacheableOptions`.
 *
 * @publicApi
 */
export type CachePutOptions = CacheableOptions;
