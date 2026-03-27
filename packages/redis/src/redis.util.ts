import { Cluster, Redis } from "ioredis";
import { Logger } from "@nestjs/common";

import { RedisClient, RedisConfig } from "./types";

const LOGGING_CONTEXT = "REDIS";

/**
 * Create a Redis client instance based on the provided configuration.
 *
 * Supports both **standalone** (single-node) and **cluster** modes.
 * When `logging` is enabled, connection success and error events are logged via the NestJS `Logger`.
 *
 * @param config  - Redis connection configuration (standalone or cluster).
 * @param logging - Whether to attach lifecycle event loggers to the client.
 * @returns A connected `RedisClient` (either `Redis` or `Cluster`).
 *
 * @example
 * ```typescript
 * const client = createRedisClient({
 *   mode: "standalone",
 *   host: "localhost",
 *   port: 6379,
 * }, true);
 * ```
 */
export function createRedisClient(config: RedisConfig, logging?: boolean) {
  let client: RedisClient;

  if (config.mode === "cluster") {
    client = new Cluster(config.nodes, config.options);

    if (logging) {
      client.on("connect", () => Logger.log("Redis cluster connected successfully", LOGGING_CONTEXT));

      client.on("error", (err: Error) => Logger.error(`Redis cluster connection failed: ${err}`, LOGGING_CONTEXT));
    }
  } else {
    client = new Redis({
      host: config.host ?? "127.0.0.1",
      port: config.port ?? 6379,
      db: config.db ? Number(config.db) : undefined,
      username: config.username,
      password: config.password,
      tls: config.tls,
    });

    if (logging) {
      client.on("connect", () =>
        Logger.log(`Redis standalone connected successfully ${config.host ?? "127.0.0.1"}:${config.port ?? 6379}`, LOGGING_CONTEXT),
      );

      client.on("error", (err: Error) => Logger.error(`Redis standalone connection failed: ${err}`, LOGGING_CONTEXT));
    }
  }

  return client;
}
