import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import Ms from "ms";

import { MetadataAccessor } from "@nestplatform/common";

import {
  CACHE_EVICT_METADATA,
  CACHE_KEY_METADATA,
  CACHE_NAMESPACE_METADATA,
  CACHE_PUT_METADATA,
  CACHE_TTL_METADATA,
  CACHEABLE_METADATA,
} from "./cacheable.constant";
import { CacheableOptions, CacheEvictOptions, CachePutOptions, KeyBuilder } from "./interfaces";

/**
 * Service that reads cache-related metadata from decorated methods using NestJS `Reflector`.
 *
 * This accessor extracts metadata set by `@Cacheable`, `@CachePut`, `@CacheEvict`,
 * and `@CacheKey` decorators and assembles them into option objects used by the
 * `CacheableFeatureDecoration` service.
 *
 * @internal This class is used internally by the `CacheableMetadataExplorer`.
 */
@Injectable()
export class CacheableMetadataAccessor extends MetadataAccessor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  /**
   * Gets the custom cache key builder from method metadata.
   * @param target - The method reference to inspect.
   * @returns The key builder, or `undefined` if not set.
   */
  public getCacheKeyMetadata(target: Function): KeyBuilder<string> | undefined {
    return this.getMetadata<KeyBuilder<string>>(CACHE_KEY_METADATA, target);
  }

  /**
   * Gets the cache namespace from method metadata.
   * @param target - The method reference to inspect.
   * @returns The namespace string, or `undefined` if not set.
   */
  public getNamespaceMetadata(target: Function): string | undefined {
    return this.getMetadata<string>(CACHE_NAMESPACE_METADATA, target);
  }

  /**
   * Gets the cache TTL from method metadata.
   * @param target - The method reference to inspect.
   * @returns The TTL as a human-readable string (e.g. `'30s'`), or `undefined` if not set.
   */
  public getTtlMetadata(target: Function): Ms.StringValue | undefined {
    return this.getMetadata<Ms.StringValue>(CACHE_TTL_METADATA, target);
  }

  /**
   * Checks whether the method is decorated with `@Cacheable`.
   * @param target - The method reference to inspect.
   * @returns `true` if the method is cacheable, `undefined` otherwise.
   */
  public getCacheableMetadata(target: Function): boolean | undefined {
    return this.getMetadata<boolean>(CACHEABLE_METADATA, target);
  }

  /**
   * Gets the eviction key builder from a `@CacheEvict`-decorated method.
   * @param target - The method reference to inspect.
   * @returns The eviction key builder, or `undefined` if not set.
   */
  public getCacheEvictMetadata(target: Function): KeyBuilder<string | string[]> | undefined {
    return this.getMetadata<KeyBuilder<string | string[]>>(CACHE_EVICT_METADATA, target);
  }

  /**
   * Checks whether the method is decorated with `@CachePut`.
   * @param target - The method reference to inspect.
   * @returns `true` if the method has cache-put behavior, `undefined` otherwise.
   */
  public getCachePutMetadata(target: Function): boolean | undefined {
    return this.getMetadata<boolean>(CACHE_PUT_METADATA, target);
  }

  /**
   * Assembles all cacheable-related metadata into a single `CacheableOptions` object.
   * @param target - The method reference to inspect.
   * @returns The assembled options, or `undefined` if the method is not `@Cacheable`.
   */
  public getAllCacheableMetadata(target: Function): CacheableOptions | undefined {
    const cacheableMetadata: boolean | undefined = this.getCacheableMetadata(target);

    if (!cacheableMetadata) return undefined;

    return {
      namespace: this.getNamespaceMetadata(target),
      key: this.getCacheKeyMetadata(target),
      ttl: this.getTtlMetadata(target),
    };
  }

  /**
   * Assembles all cache-put-related metadata into a single `CachePutOptions` object.
   * @param target - The method reference to inspect.
   * @returns The assembled options, or `undefined` if the method is not `@CachePut`.
   */
  public getAllCachePutMetadata(target: Function): CachePutOptions | undefined {
    const cachePutMetadata: boolean | undefined = this.getCachePutMetadata(target);

    if (!cachePutMetadata) return undefined;

    return {
      namespace: this.getNamespaceMetadata(target),
      key: this.getCacheKeyMetadata(target),
      ttl: this.getTtlMetadata(target),
    };
  }

  /**
   * Assembles all cache-evict-related metadata into a single `CacheEvictOptions` object.
   * @param target - The method reference to inspect.
   * @returns The assembled options, or `undefined` if the method is not `@CacheEvict`.
   */
  public getAllCacheEvictMetadata(target: Function): CacheEvictOptions | undefined {
    const cacheEvictMetadata: KeyBuilder<string | string[]> | undefined = this.getCacheEvictMetadata(target);

    if (!cacheEvictMetadata) return undefined;

    return {
      namespace: this.getNamespaceMetadata(target),
      key: cacheEvictMetadata,
    };
  }
}
