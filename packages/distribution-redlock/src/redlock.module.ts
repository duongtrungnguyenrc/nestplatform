import { ConfigurableModule } from "@nestplatform/common";
import { Module } from "@nestjs/common";

import {
  RedlockConfigAsyncProvider,
  RedlockConfigProvider,
  RedlockRedisClientsAsyncProvider,
  RedlockRedisClientsProvider,
  RedlockServiceProvider,
} from "./providers";
import { RedlockModuleConfig, RedlockModuleConfigAsync } from "./redlock.type";
import { REDLOCK_SERVICE } from "./redlock.constant";
import { RedlockService } from "./redlock.service";

/**
 * NestJS dynamic module for distributed locking using the Redlock algorithm.
 *
 * Provides `RedlockService` for acquiring, extending, and releasing
 * distributed locks across multiple Redis instances.
 *
 * @example
 * ```typescript
 * // Synchronous registration with Redis config(s)
 * RedlockModule.register({
 *   redisClients: {
 *     mode: "standalone",
 *     host: "localhost",
 *     port: 6379,
 *   },
 *   retryCount: 5,
 *   logging: true,
 * })
 *
 * // Async registration with pre-created Redis clients
 * RedlockModule.registerAsync({
 *   inject: [REDIS_CLIENT],
 *   useFactory: (redis: RedisClient) => ({
 *     redisClients: [redis],
 *     retryCount: 3,
 *   }),
 * })
 * ```
 */
@Module({})
export class RedlockModule extends ConfigurableModule {
  /**
   * Register the Redlock module with synchronous (static) configuration.
   *
   * Internally creates Redis client(s) from the provided `redisClients` config.
   *
   * @param config - Redlock and Redis connection options.
   * @returns A configured `DynamicModule`.
   */
  static register(config: RedlockModuleConfig) {
    return super.config(config, {
      module: RedlockModule,
      providers: [RedlockConfigProvider(config), RedlockRedisClientsProvider(config.redisClients), RedlockService, RedlockServiceProvider],
      exports: [RedlockService, REDLOCK_SERVICE],
    });
  }

  /**
   * Register the Redlock module with asynchronous (factory-based) configuration.
   *
   * The factory should return pre-created Redis client instances and optional Redlock configuration.
   * Registered globally by default to make the lock service available across the entire application.
   *
   * @param config - Async module options including a `useFactory` function.
   * @returns A configured `DynamicModule`.
   */
  static registerAsync(config: RedlockModuleConfigAsync) {
    return super.config(config, {
      module: RedlockModule,
      global: true,
      providers: [RedlockConfigAsyncProvider(config), RedlockRedisClientsAsyncProvider(config), RedlockService, RedlockServiceProvider],
      exports: [RedlockService, REDLOCK_SERVICE],
    });
  }
}
