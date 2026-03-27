import { FactoryProvider } from "@nestjs/common";

import { RedisClient } from "@nestplatform/redis";

import { REDLOCK_REDIS_CLIENTS } from "../redlock.constant";
import { RedlockModuleConfigAsync } from "../redlock.type";

export function RedlockRedisClientsAsyncProvider(config: RedlockModuleConfigAsync): FactoryProvider {
  return {
    provide: REDLOCK_REDIS_CLIENTS,
    useFactory: async (...deps: any[]): Promise<RedisClient[]> => {
      const resolved = await config.useFactory(...deps);

      if (!resolved.redisClients?.length) {
        throw new Error("Redlock requires at least one redis client");
      }

      return resolved.redisClients;
    },
    inject: config.inject ?? [],
  };
}
