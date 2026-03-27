import { FactoryProvider } from "@nestjs/common";

import { createRedisClient, RedisClient, RedisConfig } from "@nestplatform/redis";

import { REDLOCK_REDIS_CLIENTS } from "../redlock.constant";

export function RedlockRedisClientsProvider(redisClients: RedisConfig | RedisConfig[], logging?: boolean): FactoryProvider<RedisClient[]> {
  const configs: RedisConfig[] = Array.isArray(redisClients) ? redisClients : [redisClients];

  return {
    provide: REDLOCK_REDIS_CLIENTS,
    useFactory: () => configs.map((config) => createRedisClient(config, logging)),
  };
}
