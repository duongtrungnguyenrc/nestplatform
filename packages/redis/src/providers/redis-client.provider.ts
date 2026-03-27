import { FactoryProvider } from "@nestjs/common";

import { RedisClient, RedisConfig, RedisModuleConfigBase } from "../types";
import { REDIS_CLIENT, REDIS_CONFIG } from "../redis.constant";
import { createRedisClient } from "../redis.util";

export const RedisClientProvider = (moduleConfig: RedisModuleConfigBase): FactoryProvider<RedisClient> => ({
  provide: REDIS_CLIENT,
  inject: [REDIS_CONFIG],
  useFactory: (config: RedisConfig): RedisClient => createRedisClient(config, moduleConfig.logging),
});
