import { applyDecorators, SetMetadata } from "@nestjs/common";

import { CACHE_KEY_METADATA, CACHE_NAMESPACE_METADATA, CACHE_TTL_METADATA, CACHEABLE_METADATA } from "../cacheable.constant";
import { CacheableOptions } from "../interfaces";

/**
 * Decorator that caches the return value of a method.
 *
 * When the decorated method is called, the cache is checked first using the generated key.
 * If a cached value exists, it is returned without executing the method.
 * If no cached value exists, the method is executed, the result is cached, and then returned.
 *
 * @param options - Configuration options for caching behavior.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @Cacheable({ key: (id: string) => `user:${id}`, ttl: '30s' })
 * async findUserById(id: string): Promise<User> {
 *   return this.userRepo.findOne({ where: { id } });
 * }
 * ```
 *
 * @publicApi
 */
export const Cacheable = (options: CacheableOptions = {}): MethodDecorator => {
  return applyDecorators(
    SetMetadata(CACHEABLE_METADATA, true),
    ...(options.key ? [SetMetadata(CACHE_KEY_METADATA, options.key)] : []),
    ...(options.namespace ? [SetMetadata(CACHE_NAMESPACE_METADATA, options.namespace)] : []),
    ...(options.ttl ? [SetMetadata(CACHE_TTL_METADATA, options.ttl)] : []),
  );
};
