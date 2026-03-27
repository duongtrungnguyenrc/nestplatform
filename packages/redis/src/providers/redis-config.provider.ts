import { ValueProvider } from "@nestjs/common";

import { REDIS_CONFIG } from "../redis.constant";
import { RedisConfig } from "../types";

export const RedisConfigProvider = (config: RedisConfig): ValueProvider<RedisConfig> => ({
  provide: REDIS_CONFIG,
  useValue: config,
});
