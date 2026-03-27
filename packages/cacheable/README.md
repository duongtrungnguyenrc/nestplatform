# @nestplatform/cacheable

Spring-like declarative caching decorators for NestJS based on `cache-manager`.

## Features

- **Declarative Caching**: Use `@Cacheable`, `@CachePut`, and `@CacheEvict` decorators.
- **Fully Configurable**: Support for custom cache keys, namespaces, and TTLs.
- **Version Independent**: Compatible with `cache-manager` v5 and v6+.
- **Request Deduplication**: Prevents cache stampede by deduplicating concurrent requests for the same key.
- **Asynchronous**: Built for modern asynchronous NestJS applications.

## Installation

```bash
npm install @nestplatform/cacheable @nestjs/cache-manager cache-manager ms
```

## Setup

Register the `CacheableModule` in your `AppModule`. It wraps the standard `@nestjs/cache-manager` `CacheModule`.

### Synchronous Registration

```typescript
import { CacheableModule } from '@nestplatform/cacheable';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CacheableModule.register({
      ttl: 60000, // global default TTL in ms
    }),
  ],
})
export class AppModule {}
```

### Asynchronous Registration

```typescript
import { CacheableModule } from '@nestplatform/cacheable';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheableModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('CACHE_TTL'),
      }),
    }),
  ],
})
export class AppModule {}
```

## Usage

### `@Cacheable`

Caches the result of a method call. Subsequent calls with the same arguments will return the cached value.

```typescript
import { Cacheable } from '@nestplatform/cacheable';

@Injectable()
export class UserService {
  @Cacheable({ key: (id: string) => `user:${id}`, ttl: '1h' })
  async findOne(id: string) {
    return this.userRepository.findOne(id);
  }
}
```

### `@CachePut`

Always executes the method and updates the cache with the result.

```typescript
import { CachePut } from '@nestplatform/cacheable';

@Injectable()
export class UserService {
  @CachePut({ key: (id: string, data: any) => `user:${id}` })
  async update(id: string, data: any) {
    return this.userRepository.update(id, data);
  }
}
```

### `@CacheEvict`

Removes one or more entries from the cache.

```typescript
import { CacheEvict } from '@nestplatform/cacheable';

@Injectable()
export class UserService {
  @CacheEvict({ key: (id: string) => `user:${id}` })
  async remove(id: string) {
    return this.userRepository.delete(id);
  }
}
```

### Custom Cache Keys

You can use a static string or a builder function that has access to the method arguments.

```typescript
@Cacheable({ key: 'static-key' })
@Cacheable({ key: (id: string) => `user:${id}` })
```

### TTL Configuration

TTL can be a number (in milliseconds) or a human-readable string (e.g., `'1h'`, `'30s'`, `'15m'`).

```typescript
@Cacheable({ ttl: 30000 })
@Cacheable({ ttl: '30s' })
```

### Namespaces

Namespaces allow you to prefix your cache keys, useful for grouping related cache entries.

```typescript
@Cacheable({ namespace: 'v1', key: (id) => `user:${id}` }) // Result: v1:user:123
```
## Changelog

### 1.0.1
- Resolve ms dependency issue

### 1.0.0
- Initial release with core cacheable logic .


## License

MIT
