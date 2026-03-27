import { Inject } from "@nestjs/common";

import { REDIS_CLIENT } from "./redis.constant";

/**
 * Parameter decorator that injects the Redis client instance.
 *
 * When called without arguments, injects the default client (`REDIS_CLIENT` token).
 * Pass a custom token to inject a specific named client when multiple Redis connections are registered.
 *
 * @param token - Optional custom injection token. Defaults to `REDIS_CLIENT`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CacheService {
 *   constructor(@InjectRedis() private readonly redis: RedisClient) {}
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With a custom injection token
 * @Injectable()
 * export class SessionService {
 *   constructor(@InjectRedis('SESSION_REDIS') private readonly redis: RedisClient) {}
 * }
 * ```
 */
export const InjectRedis = (token?: string | symbol) => Inject(token ?? REDIS_CLIENT);
