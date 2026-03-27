import { ConfigurableModule } from "@nestplatform/common";
import { DynamicModule, Module } from "@nestjs/common";

import { RedisAsyncConfigProvider, RedisClientProvider, RedisConfigProvider } from "./providers";
import { RedisModuleConfigAsync, RedisModuleConfigSync } from "./types";
import { REDIS_CLIENT } from "./redis.constant";

/**
 * NestJS dynamic module for creating and managing Redis connections.
 *
 * Supports both standalone and cluster modes via `ioredis`.
 * Use `register()` for synchronous configuration or `registerAsync()` for factory-based setup.
 *
 * @example
 * ```typescript
 * // Synchronous registration
 * RedisModule.register({
 *   mode: "standalone",
 *   host: "localhost",
 *   port: 6379,
 *   logging: true,
 * })
 *
 * // Async registration with ConfigService
 * RedisModule.registerAsync({
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     mode: "standalone",
 *     host: config.get("REDIS_HOST"),
 *     port: config.get("REDIS_PORT"),
 *   }),
 * })
 * ```
 */
@Module({})
export class RedisModule extends ConfigurableModule {
  /**
   * Register the Redis module with synchronous (static) configuration.
   *
   * @param config - Redis connection and module options.
   * @returns A configured `DynamicModule`.
   */
  static register(config: RedisModuleConfigSync): DynamicModule {
    return super.config(config, {
      module: RedisModule,
      providers: [RedisConfigProvider(config), RedisClientProvider(config)],
      exports: [config.injectionToken || REDIS_CLIENT],
    });
  }

  /**
   * Register the Redis module with asynchronous (factory-based) configuration.
   *
   * @param config - Async module options including a `useFactory` function.
   * @returns A configured `DynamicModule`.
   */
  static registerAsync(config: RedisModuleConfigAsync): DynamicModule {
    return super.config(config, {
      module: RedisModule,
      providers: [RedisAsyncConfigProvider(config), RedisClientProvider(config)],
      exports: [config.injectionToken || REDIS_CLIENT],
    });
  }
}
