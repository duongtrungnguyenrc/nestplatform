# @nestplatform/redis

A flexible NestJS module for managing Redis connections, supporting both standalone and cluster modes via `ioredis`.

## Features

- 🔌 **Standalone & Cluster**: First-class support for single-node and cluster deployments.
- 🔒 **TLS/SSL**: Built-in TLS configuration for secure connections.
- 🏷️ **Custom Tokens**: Register multiple Redis connections with custom injection tokens.
- ⚡ **Async Config**: Factory-based registration for runtime configuration (e.g., from `ConfigService`).
- 💉 **Decorator Support**: `@InjectRedis()` for clean dependency injection.
- 📝 **Logging**: Optional connection lifecycle logging.

## Installation

```bash
npm install @nestplatform/redis ioredis
```

## Usage

### 1. Register the module

#### Synchronous

```typescript
import { RedisModule } from '@nestplatform/redis';

@Module({
  imports: [
    RedisModule.register({
      mode: 'standalone',
      host: 'localhost',
      port: 6379,
      logging: true,
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous (with ConfigService)

```typescript
import { RedisModule } from '@nestplatform/redis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        mode: 'standalone',
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
      }),
      logging: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Inject the client

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis, RedisClient } from '@nestplatform/redis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: RedisClient) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'PX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }
}
```

### 3. Multiple connections

Register multiple Redis instances with custom injection tokens:

```typescript
@Module({
  imports: [
    RedisModule.register({
      mode: 'standalone',
      host: 'cache-host',
      port: 6379,
      injectionToken: 'CACHE_REDIS',
    }),
    RedisModule.register({
      mode: 'standalone',
      host: 'session-host',
      port: 6379,
      injectionToken: 'SESSION_REDIS',
    }),
  ],
})
export class AppModule {}

@Injectable()
export class SessionService {
  constructor(@InjectRedis('SESSION_REDIS') private readonly redis: RedisClient) {}
}
```

## Cluster Mode

```typescript
RedisModule.register({
  mode: 'cluster',
  nodes: [
    { host: 'node1.redis.example.com', port: 6379 },
    { host: 'node2.redis.example.com', port: 6379 },
    { host: 'node3.redis.example.com', port: 6379 },
  ],
  options: {
    redisOptions: { password: 'secret' },
  },
  logging: true,
})
```

## TLS Configuration

```typescript
RedisModule.register({
  mode: 'standalone',
  host: 'secure.redis.example.com',
  port: 6380,
  tls: {
    ca: fs.readFileSync('/path/to/ca.pem'),
    rejectUnauthorized: true,
  },
})
```

## API Reference

| Export | Description |
|--------|-------------|
| `RedisModule` | Dynamic NestJS module with `register()` and `registerAsync()` |
| `InjectRedis(token?)` | Parameter decorator for injecting the Redis client |
| `createRedisClient(config, logging?)` | Utility to manually create an `ioredis` client |
| `RedisClient` | Type alias for `Redis \| Cluster` from `ioredis` |
| `RedisConfig` | Discriminated union of standalone and cluster configs |
| `REDIS_CLIENT` | Default injection token for the client |
| `REDIS_CONFIG` | Injection token for the config object |

## Changelog

### 1.0.0
- Initial release with standalone and cluster support.

## License

MIT
