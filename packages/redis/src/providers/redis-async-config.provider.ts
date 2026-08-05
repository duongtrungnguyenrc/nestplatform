import { FactoryProvider } from "@nestjs/common";

import { RedisModuleConfigAsync, RedisConfig } from "../types";
import { REDIS_CONFIG } from "../redis.constant";

export const RedisAsyncConfigProvider = (config: RedisModuleConfigAsync): FactoryProvider<any> => ({
  inject: config.inject,
  provide: REDIS_CONFIG,
  useFactory: config.useFactory,
});
