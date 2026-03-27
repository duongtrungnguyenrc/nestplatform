import { FeatureExplorerModule } from "@nestplatform/common";
import { DynamicModule, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

import { CacheableMetadataAccessor } from "./cacheable-metadata.accessor";
import { CacheableMetadataExplorer } from "./cacheable-metadata.explorer";
import { CacheableFeatureDecoration } from "./cacheable-feature.decoration";
import { CacheModuleAsyncOptions, CacheModuleOptions } from "./interfaces";

/**
 * NestJS module that enables declarative caching via decorators.
 *
 * Provides `@Cacheable`, `@CachePut`, and `@CacheEvict` decorators that work
 * with `@nestjs/cache-manager`. Use `register()` or `registerAsync()` to configure
 * the cache store and register this module.
 *
 * @example
 * ```typescript
 * // Synchronous registration (in-memory)
 * @Module({
 *   imports: [CacheableModule.register({ ttl: 60000 })],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Async registration (e.g. with Redis)
 * @Module({
 *   imports: [
 *     CacheableModule.registerAsync({
 *       imports: [ConfigModule],
 *       inject: [ConfigService],
 *       useFactory: (config: ConfigService) => ({
 *         stores: [new Keyv(config.get('REDIS_URL'))],
 *         ttl: 60000,
 *       }),
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @publicApi
 */
@Module({})
export class CacheableModule {
  private static readonly providers = [CacheableMetadataAccessor, CacheableMetadataExplorer, CacheableFeatureDecoration];

  /**
   * Registers the `CacheableModule` with synchronous cache configuration.
   *
   * This configures both the underlying `@nestjs/cache-manager` `CacheModule`
   * and the cacheable decorator infrastructure.
   *
   * @param options - Cache configuration options (stores, ttl, namespace, etc.).
   * @returns A configured `DynamicModule`.
   *
   * @publicApi
   */
  static register(options: CacheModuleOptions = {}): DynamicModule {
    return {
      module: CacheableModule,
      imports: [FeatureExplorerModule, CacheModule.register(options)],
      providers: [...CacheableModule.providers],
      exports: [CacheModule],
    };
  }

  /**
   * Registers the `CacheableModule` with asynchronous cache configuration.
   *
   * Use this when cache options depend on other providers (e.g. `ConfigService`).
   *
   * @param options - Async configuration with `useFactory`, `useClass`, or `useExisting`.
   * @returns A configured `DynamicModule`.
   *
   * @publicApi
   */
  static registerAsync(options: CacheModuleAsyncOptions = {}): DynamicModule {
    return {
      module: CacheableModule,
      imports: [FeatureExplorerModule, CacheModule.registerAsync(options)],
      providers: [...CacheableModule.providers],
      exports: [CacheModule],
    };
  }
}
