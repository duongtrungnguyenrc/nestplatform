import { SetMetadata } from "@nestjs/common";

import { CACHE_KEY_METADATA } from "../cacheable.constant";

/**
 * Decorator that sets a static cache key for a method.
 *
 * This is a simpler alternative to the `key` option in `@Cacheable` / `@CachePut`
 * when you need a fixed cache key that doesn't depend on method arguments.
 *
 * @param key - The static cache key string.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @CacheKey('all-users')
 * @Cacheable()
 * async findAllUsers(): Promise<User[]> {
 *   return this.userRepo.find();
 * }
 * ```
 *
 * @publicApi
 */
export const CacheKey = (key: string): MethodDecorator => {
  return SetMetadata(CACHE_KEY_METADATA, key);
};
