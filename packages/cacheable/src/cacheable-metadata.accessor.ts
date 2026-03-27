import { Injectable, Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as Ms from "ms";

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
   * Returns cache key metadata from the target method.
   *
   * @param target The target method
   * @returns KeyBuilder or string or undefined
   */
  getCacheKeyMetadata(target: Function | Type<any>): KeyBuilder<any> | string | undefined {
    return this.reflector.get(CACHE_KEY_METADATA, target);
  }

  /**
   * Gets the cache namespace from method metadata.
   * @param target - The method reference to inspect.
   * @returns The namespace string, or `undefined` if not set.
   */
  public getNamespaceMetadata(target: Function | Type<any>): string | undefined {
    return this.reflector.get<string>(CACHE_NAMESPACE_METADATA, target);
  }

  /**
   * Gets the cache TTL from method metadata.
   * @param target - The method reference to inspect.
   * @returns The TTL as a human-readable string (e.g. `'30s'`), or `undefined` if not set.
   */
  public getTtlMetadata(target: Function | Type<any>): Ms.StringValue | undefined {
    return this.reflector.get<Ms.StringValue>(CACHE_TTL_METADATA, target);
  }

  /**
   * Returns cacheable metadata from the target method.
   *
   * @param target The target method
   * @returns CacheableOptions or undefined
   */
  public getCacheableMetadata(target: Function | Type<any>): CacheableOptions | undefined {
    return this.reflector.get(CACHEABLE_METADATA, target);
  }

  /**
   * Checks if the target method has cacheable metadata.
   *
   * @param target The target method
   * @returns boolean
   */
  public isCacheable(target: Function | Type<any>): boolean {
    return !!this.getCacheableMetadata(target);
  }

  /**
   * Returns cache evict metadata from the target method.
   *
   * @param target The target method
   * @returns CacheEvictOptions or undefined
   */
  public getCacheEvictMetadata(target: Function | Type<any>): CacheEvictOptions | undefined {
    return this.reflector.get(CACHE_EVICT_METADATA, target);
  }

  /**
   * Checks if the target method has cache evict metadata.
   *
   * @param target The target method
   * @returns boolean
   */
  public isCacheEvict(target: Function | Type<any>): boolean {
    return !!this.getCacheEvictMetadata(target);
  }

  /**
   * Returns cache put metadata from the target method.
   *
   * @param target The target method
   * @returns CachePutOptions or undefined
   */
  public getCachePutMetadata(target: Function | Type<any>): CachePutOptions | undefined {
    return this.reflector.get(CACHE_PUT_METADATA, target);
  }

  /**
   * Checks if the target method has cache put metadata.
   *
   * @param target The target method
   * @returns boolean
   */
  public isCachePut(target: Function | Type<any>): boolean {
    return !!this.getCachePutMetadata(target);
  }

  /**
   * Assembles all cacheable-related metadata into a single `CacheableOptions` object.
   * @param target - The method reference to inspect.
   * @returns The assembled options, or `undefined` if the method is not `@Cacheable`.
   */
  public getAllCacheableMetadata(target: Function | Type<any>): CacheableOptions | undefined {
    if (!this.isCacheable(target)) return undefined;

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
  public getAllCachePutMetadata(target: Function | Type<any>): CachePutOptions | undefined {
    if (!this.isCachePut(target)) return undefined;

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
  public getAllCacheEvictMetadata(target: Function | Type<any>): CacheEvictOptions | undefined {
    const options = this.getCacheEvictMetadata(target);

    if (!options) return undefined;

    return {
      ...options,
      namespace: options.namespace || this.getNamespaceMetadata(target),
      key: options.key || (this.getCacheKeyMetadata(target) as any),
    };
  }
}
