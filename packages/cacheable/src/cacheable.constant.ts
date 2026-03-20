/**
 * Metadata key for `@CacheKey` decorator.
 * @internal
 */
export const CACHE_KEY_METADATA = Symbol.for("metadata:cache_key");

/**
 * Metadata key for cache TTL configuration.
 * @internal
 */
export const CACHE_TTL_METADATA = Symbol.for("metadata:cache_ttl");

/**
 * Metadata key for cache namespace configuration.
 * @internal
 */
export const CACHE_NAMESPACE_METADATA = Symbol.for("metadata:cache_namespace");

/**
 * Metadata key for `@Cacheable` decorator.
 * @internal
 */
export const CACHEABLE_METADATA = Symbol.for("metadata:cacheable");

/**
 * Metadata key for `@CacheEvict` decorator.
 * @internal
 */
export const CACHE_EVICT_METADATA = Symbol.for("metadata:cache_evict");

/**
 * Metadata key for `@CachePut` decorator.
 * @internal
 */
export const CACHE_PUT_METADATA = Symbol.for("metadata:cache_put");
