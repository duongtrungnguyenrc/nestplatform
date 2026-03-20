import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import * as cacheManagerPackage from "cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import ms from "ms";

import { FeatureDecoration } from "@nestplatform/common";

import { CacheableOptions, CacheEvictOptions, CachePutOptions, CacheTtl } from "./interfaces";
import { generateComposedKey } from "./cacheable.helpers";

/**
 * Core service that implements the caching logic for all cache decorators.
 *
 * This service is responsible for wrapping methods with caching behavior
 * based on the decorator metadata (`@Cacheable`, `@CachePut`, `@CacheEvict`).
 * It integrates with NestJS `cache-manager` and supports both v4 and v5+ APIs.
 *
 * @internal This class is used internally by the `CacheableMetadataExplorer`.
 */
@Injectable()
export class CacheableFeatureDecoration extends FeatureDecoration {
  private readonly pendingCacheMap = new Map<string, Promise<any>>();
  private readonly isCacheManagerV5OrGreater: boolean;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    super();

    this.isCacheManagerV5OrGreater = typeof (cacheManagerPackage as any).createCache === "function";
  }

  /**
   * Fetches a cached value by key with deduplication for concurrent requests.
   *
   * If multiple calls request the same key simultaneously, only one cache lookup
   * is performed and the result is shared across all callers.
   *
   * @param key - The cache key to look up.
   * @returns The cached value, or `undefined` if not found.
   */
  private async fetchCachedValue(key: string) {
    let pendingCachePromise = this.pendingCacheMap.get(key);

    if (!pendingCachePromise) {
      pendingCachePromise = this.cache.get(key) || Promise.resolve(undefined);
      this.pendingCacheMap.set(key, pendingCachePromise);
    }

    try {
      return await pendingCachePromise;
    } finally {
      this.pendingCacheMap.delete(key);
    }
  }

  /**
   * Parses a TTL value into the format expected by the active cache-manager version.
   *
   * @param ttl - TTL as a number (ms) or a human-readable string (e.g. `'30s'`, `'5m'`).
   * @returns The parsed TTL in the format expected by cache-manager.
   */
  private parseCacheTtl(ttl?: CacheTtl): number | { ttl: number } | undefined {
    const parsedTtl: number | undefined = !ttl || typeof ttl === "number" ? ttl : ms(ttl);

    if (!parsedTtl) return undefined;

    return this.isCacheManagerV5OrGreater ? parsedTtl : { ttl: parsedTtl };
  }

  /**
   * Wraps a method with `@Cacheable` behavior.
   *
   * On method invocation:
   * 1. Generates a cache key from the options and method arguments.
   * 2. Checks the cache for an existing value.
   * 3. If found, returns the cached value without executing the original method.
   * 4. If not found, executes the original method, stores the result, and returns it.
   *
   * @param instance - The class instance that owns the method.
   * @param methodName - The name of the method being wrapped.
   * @param originalMethod - The original method function reference.
   * @param options - Caching options (key, namespace, ttl).
   */
  public wrapWithCacheable(instance: any, methodName: string, originalMethod: Function, options: CacheableOptions): void {
    instance[methodName] = async (...args: any[]): Promise<any> => {
      const composeOptions: Parameters<typeof generateComposedKey>[0] = {
        methodName: methodName,
        key: options.key,
        namespace: options.namespace,
        args,
      };

      const cacheKeys: string[] = generateComposedKey(composeOptions);

      try {
        const cachedValue = await this.fetchCachedValue(cacheKeys[0]);
        if (cachedValue !== undefined && cachedValue !== null) return cachedValue;
        /* eslint-disable-next-line no-empty */
      } catch {}

      const ttl: number | { ttl: number } | undefined = this.parseCacheTtl(options.ttl);
      const result: any = await originalMethod.apply(instance, args);

      await this.cache.set(cacheKeys[0], result, ttl as any);

      return result;
    };
  }

  /**
   * Wraps a method with `@CachePut` behavior.
   *
   * On method invocation:
   * 1. Always executes the original method (no cache check).
   * 2. Stores the result in the cache with the generated key.
   * 3. Returns the method result.
   *
   * @param instance - The class instance that owns the method.
   * @param methodName - The name of the method being wrapped.
   * @param originalMethod - The original method function reference.
   * @param options - Cache put options (key, namespace, ttl).
   */
  public wrapMethodWithCachePut(instance: any, methodName: string, originalMethod: Function, options: CachePutOptions): void {
    instance[methodName] = async (...args: any[]): Promise<any> => {
      const composeOptions: Parameters<typeof generateComposedKey>[0] = {
        methodName: methodName,
        key: options.key,
        namespace: options.namespace,
        args,
      };

      const cacheKeys: string[] = generateComposedKey(composeOptions);
      const ttl: number | { ttl: number } | undefined = this.parseCacheTtl(options.ttl);
      const result: any = await originalMethod.apply(instance, args);

      await this.cache.set(cacheKeys[0], result, ttl as any);

      return result;
    };
  }

  /**
   * Wraps a method with `@CacheEvict` behavior.
   *
   * On method invocation:
   * 1. Deletes all specified cache keys.
   * 2. Executes the original method and returns its result.
   *
   * Cache eviction errors are silently caught to avoid affecting the main business logic.
   *
   * @param instance - The class instance that owns the method.
   * @param methodName - The name of the method being wrapped.
   * @param originalMethod - The original method function reference.
   * @param options - Cache eviction options (key, namespace).
   */
  public wrapMethodWithCacheEvict(instance: any, methodName: string, originalMethod: Function, options: CacheEvictOptions): void {
    instance[methodName] = async (...args: any[]): Promise<any> => {
      try {
        const optionsKeys = Array.isArray(options.key) ? options.key : [options.key];

        const keysToDelete: string[] = optionsKeys.flatMap((key) => {
          const composed: string[] = generateComposedKey({
            namespace: options.namespace,
            methodName,
            key,
            args,
          });

          return Array.isArray(composed) ? composed : [composed];
        });

        await Promise.all(keysToDelete.map((key: string): Promise<boolean> => this.cache.del(key)));

        /* eslint-disable-next-line no-empty */
      } catch {} // Empty catch to avoid affecting the main logic

      return originalMethod.apply(instance, args);
    };
  }
}
