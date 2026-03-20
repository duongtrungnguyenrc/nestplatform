import { Injectable } from "@nestjs/common";

import { IFeatureExplorer, MethodContext, FeatureExplorer } from "@nestplatform/common";

import { CacheableOptions, CacheEvictOptions, CachePutOptions } from "./interfaces";
import { CacheableFeatureDecoration } from "./cacheable-feature.decoration";
import { CacheableMetadataAccessor } from "./cacheable-metadata.accessor";

/**
 * Explorer service that discovers cache-decorated methods at bootstrap time.
 *
 * This service implements the `IFeatureExplorer` interface from `@nestplatform/common`.
 * During module initialization, it inspects every provider method for `@Cacheable`,
 * `@CachePut`, and `@CacheEvict` metadata and wraps matching methods with the
 * appropriate caching behavior via `CacheableFeatureDecoration`.
 *
 * @internal This class is registered as a provider in `CacheableModule`.
 */
@Injectable()
@FeatureExplorer()
export class CacheableMetadataExplorer implements IFeatureExplorer {
  constructor(
    private readonly cacheFeatureDecoration: CacheableFeatureDecoration,
    private readonly cacheMetadataAccessor: CacheableMetadataAccessor,
  ) {}

  /**
   * Called for each method of each provider during module initialization.
   *
   * Inspects the method for cache-related metadata and wraps it accordingly:
   * - `@Cacheable` → checks cache before executing, stores result on miss
   * - `@CachePut` → always executes, updates cache with result
   * - `@CacheEvict` → deletes cache entries, then executes
   *
   * @param ctx - The method context containing instance, method name, and method reference.
   */
  public onMethod(ctx: MethodContext) {
    const { instance, methodName, methodRef } = ctx;

    // @Cacheable
    const cacheable: CacheableOptions | undefined = this.cacheMetadataAccessor.getAllCacheableMetadata(methodRef);

    if (cacheable) {
      this.cacheFeatureDecoration.wrapWithCacheable(instance, methodName, methodRef, cacheable);
    }

    // @CachePut
    const cachePut: CachePutOptions | undefined = this.cacheMetadataAccessor.getAllCachePutMetadata(methodRef);

    if (cachePut) {
      this.cacheFeatureDecoration.wrapMethodWithCachePut(instance, methodName, methodRef, cachePut);
    }

    // @CacheEvict
    const cacheEvict: CacheEvictOptions | undefined = this.cacheMetadataAccessor.getAllCacheEvictMetadata(methodRef);

    if (cacheEvict) {
      this.cacheFeatureDecoration.wrapMethodWithCacheEvict(instance, methodName, methodRef, cacheEvict);
    }
  }
}
