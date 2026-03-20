import { applyDecorators, SetMetadata } from "@nestjs/common";

import { CACHE_KEY_METADATA, CACHE_NAMESPACE_METADATA, CACHE_PUT_METADATA, CACHE_TTL_METADATA } from "../cacheable.constant";
import { CachePutOptions } from "../interfaces";

/**
 * Decorator that always executes the method and updates the cache with the result.
 *
 * Unlike `@Cacheable`, this decorator does NOT check the cache before executing.
 * The method is always called, and its return value is stored in the cache.
 * Useful for update operations where you want to refresh the cached value.
 *
 * @param options - Configuration options for cache put behavior.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @CachePut({ key: (id: string, dto: UpdateUserDto) => `user:${id}`, ttl: '30s' })
 * async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
 *   return this.userRepo.save({ id, ...dto });
 * }
 * ```
 *
 * @publicApi
 */
export const CachePut = (options: CachePutOptions = {}): MethodDecorator => {
  return applyDecorators(
    SetMetadata(CACHE_PUT_METADATA, true),
    ...(options.key ? [SetMetadata(CACHE_KEY_METADATA, options.key)] : []),
    ...(options.namespace ? [SetMetadata(CACHE_NAMESPACE_METADATA, options.namespace)] : []),
    ...(options.ttl ? [SetMetadata(CACHE_TTL_METADATA, options.ttl)] : []),
  );
};
