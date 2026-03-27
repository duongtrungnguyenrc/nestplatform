import { Module } from "@nestjs/common";
import { DistributionLockModule } from "@nestplatform/distribution-lock";
import { RedlockModule, RedlockService } from "@nestplatform/distribution-redlock";
import { RedisModule, REDIS_CLIENT } from "@nestplatform/redis";
import { LockController } from "./lock.controller";
import { LockService } from "./lock.service";
import Redis from "ioredis";

@Module({
  imports: [
    RedisModule.register({
      global: true,
      mode: "standalone",
      host: "localhost",
      port: 6379,
    }),
    RedlockModule.registerAsync({
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        redisClients: [redis],
        retryCount: 3,
      }),
    }),
    DistributionLockModule.registerAsync({
      inject: [RedlockService],
      useFactory: (redlock: RedlockService) => ({
        providers: redlock,
      }),
    }),
  ],
  controllers: [LockController],
  providers: [LockService],
})
export class AppModule {}
