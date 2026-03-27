import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Controller("redis")
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get("ping")
  async ping() {
    return this.redisService.ping();
  }

  @Post("set")
  async setKey(@Body() body: { key: string; value: string }) {
    return this.redisService.setValue(body.key, body.value);
  }

  @Get("get/:key")
  async getKey(@Param("key") key: string) {
    return this.redisService.getValue(key);
  }
}
