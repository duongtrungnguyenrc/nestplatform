import { applyDecorators, SetMetadata } from "@nestjs/common";

import { CACHE_EVICT_METADATA, CACHE_NAMESPACE_METADATA } from "../cacheable.constant";
import { CacheEvictOptions } from "../interfaces";

/**
 * Decorator that evicts (deletes) one or more entries from the cache when the method is called.
 *
 * The decorated method is executed normally, and the specified cache keys are deleted.
 * Cache eviction happens before the method executes to ensure stale data is removed.
 *
 * @param options - Configuration options specifying which keys to evict.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @CacheEvict({ key: (id: string) => `user:${id}` })
 * async deleteUser(id: string): Promise<void> {
 *   await this.userRepo.delete(id);
 * }
 * ```
 *
 * @publicApi
 */
export const CacheEvict = (options: CacheEvictOptions): MethodDecorator => {
  return applyDecorators(
    SetMetadata(CACHE_EVICT_METADATA, options.key),
    ...(options.namespace ? [SetMetadata(CACHE_NAMESPACE_METADATA, options.namespace)] : []),
  );
};
