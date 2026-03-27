import type { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";

import { RedisConfig } from "./redis.type";

/**
 * Base module configuration options shared by sync and async registration.
 */
export type RedisModuleConfigBase = ModuleConfigBase & {
  /** Enable connection lifecycle logging. */
  logging?: boolean;
};

/**
 * Synchronous module configuration.
 *
 * Combines the Redis connection config with module options for use with `RedisModule.register()`.
 */
export type RedisModuleConfigSync = RedisConfig & RedisModuleConfigBase;

/**
 * Asynchronous module configuration.
 *
 * Uses a factory function to produce the Redis connection config at runtime,
 * for use with `RedisModule.registerAsync()`.
 */
export type RedisModuleConfigAsync = RedisModuleConfigBase & ModuleConfigAsync<RedisConfig>;
