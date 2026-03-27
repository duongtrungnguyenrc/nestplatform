import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@nestplatform/redis";
import Redis from "ioredis";

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async ping() {
    const result = await this.redis.ping();
    return { success: true, message: `Redis ping: ${result}` };
  }

  async setValue(key: string, value: string) {
    await this.redis.set(key, value, "EX", 60);
    return { success: true, message: `Set key '${key}' effectively` };
  }

  async getValue(key: string) {
    const result = await this.redis.get(key);
    return { success: true, value: result };
  }
}
