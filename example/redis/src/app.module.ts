import { Module } from "@nestjs/common";
import { RedisModule } from "@nestplatform/redis";
import { RedisController } from "./redis.controller";
import { RedisService } from "./redis.service";

@Module({
  imports: [
    RedisModule.register({
      mode: "standalone",
      host: "localhost",
      port: 6379,
    }),
  ],
  controllers: [RedisController],
  providers: [RedisService],
})
export class AppModule {}
