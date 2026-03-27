# @nestplatform/distribution-redlock

A distributed locking module for NestJS implementing the [Redlock algorithm](https://redis.io/docs/manual/patterns/distributed-locks/), built on top of `@nestplatform/redis`.

## Features

- 🔐 **Distributed Locking**: Quorum-based lock acquisition across multiple Redis instances.
- ♻️ **Auto-Extension**: Locks are automatically extended before expiration when using `withLock`.
- 🔁 **Configurable Retries**: Retry count, delay, and jitter for resilient lock acquisition.
- 🛡️ **Abort Signal**: Handler receives an `AbortSignal` if lock extension fails.
- 🎯 **ORM Agnostic**: Implements `IDistributedLockService` from `@nestplatform/distribution-lock`.
- 📝 **Observable**: Emits `error` events for monitoring partial failures.

## Installation

```bash
npm install @nestplatform/distribution-redlock @nestplatform/redis @nestplatform/distribution-lock ioredis
```

## Usage

### 1. Register the module

#### Synchronous (creates Redis clients internally)

```typescript
import { RedlockModule } from '@nestplatform/distribution-redlock';

@Module({
  imports: [
    RedlockModule.register({
      redisClients: [
        { mode: 'standalone', host: 'redis-1', port: 6379 },
        { mode: 'standalone', host: 'redis-2', port: 6379 },
        { mode: 'standalone', host: 'redis-3', port: 6379 },
      ],
      retryCount: 5,
      retryDelay: 200,
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous (reuse existing Redis clients)

```typescript
import { RedlockModule } from '@nestplatform/distribution-redlock';
import { REDIS_CLIENT } from '@nestplatform/redis';

@Module({
  imports: [
    RedisModule.register({
      mode: 'standalone',
      host: 'localhost',
      port: 6379,
    }),
    RedlockModule.registerAsync({
      inject: [REDIS_CLIENT],
      useFactory: (redis: RedisClient) => ({
        redisClients: [redis],
        retryCount: 3,
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Use the service

#### Basic acquire / release

```typescript
import { Injectable } from '@nestjs/common';
import { RedlockService } from '@nestplatform/distribution-redlock';

@Injectable()
export class OrderService {
  constructor(private readonly redlock: RedlockService) {}

  async processOrder(orderId: string) {
    const lock = await this.redlock.acquire([`order:${orderId}`], 5000);
    try {
      // Perform exclusive work...
      await this.doWork(orderId);
    } finally {
      await lock.release();
    }
  }
}
```

#### Using `withLock` (recommended)

The `withLock` method handles acquire, auto-extend, and release automatically:

```typescript
@Injectable()
export class PaymentService {
  constructor(private readonly redlock: RedlockService) {}

  async transfer(senderId: string, recipientId: string, amount: number) {
    return this.redlock.withLock(
      [`account:${senderId}`, `account:${recipientId}`],
      5000,
      async (signal) => {
        // Check abort signal for extension failures
        if (signal.aborted) throw signal.error;

        const sender = await this.getBalance(senderId);
        if (sender < amount) throw new Error('Insufficient balance');

        await this.updateBalances(senderId, recipientId, amount);
        return { success: true };
      },
    );
  }
}
```

#### Using with `@DistributedLock` decorator

When combined with `@nestplatform/distribution-lock`, you can use the declarative decorator:

```typescript
import { DistributedLock } from '@nestplatform/distribution-lock';

@Injectable()
export class InventoryService {
  @DistributedLock({ resources: (args) => [`product:${args[0]}`], duration: 3000 })
  async reserveStock(productId: string, quantity: number) {
    // This method runs under a distributed lock automatically
    const stock = await this.getStock(productId);
    if (stock < quantity) throw new Error('Out of stock');
    await this.updateStock(productId, stock - quantity);
  }
}
```

### 3. Listen to events

`RedlockService` extends `EventEmitter` and emits events for observability:

```typescript
@Injectable()
export class LockMonitor implements OnModuleInit {
  constructor(private readonly redlock: RedlockService) {}

  onModuleInit() {
    this.redlock.on('error', (error) => {
      // Non-fatal errors on minority nodes (quorum not affected)
      console.warn('Redlock partial failure:', error.message);
    });
  }
}
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `driftFactor` | `0.01` | Clock drift factor (1% of lock TTL) |
| `retryCount` | `3` | Max retry attempts (`-1` for infinite) |
| `retryDelay` | `200` | Delay in ms between retries |
| `retryJitter` | `100` | Random jitter ±ms added to retry delay |
| `automaticExtensionThreshold` | `500` | Extend lock this many ms before expiration |
| `logging` | `false` | Enable lifecycle logging |

## API Reference

| Export | Description |
|--------|-------------|
| `RedlockModule` | Dynamic NestJS module with `register()` and `registerAsync()` |
| `RedlockService` | Core service: `acquire()`, `release()`, `extend()`, `withLock()` |
| `RedLock` | Lock handle with convenience `release()` and `extend()` methods |
| `RedlockConfig` | Configuration type for the algorithm |
| `Client` | Type alias for `RedisClient` from `@nestplatform/redis` |
| `REDLOCK_SERVICE` | Injection token for token-based injection |

## How Redlock Works

The [Redlock algorithm](https://redis.io/docs/manual/patterns/distributed-locks/) achieves distributed mutual exclusion by:

1. **Acquire**: Set a key with a random value and TTL on N independent Redis nodes.
2. **Quorum**: The lock is acquired if the majority (⌊N/2⌋ + 1) succeed within the TTL.
3. **Release**: Delete the key only if it still holds the original random value.
4. **Clock Drift**: A drift factor compensates for clock skew between nodes.

For maximum safety, use **3 or 5** independent Redis instances (not replicas).

## Changelog

### 1.0.0
- Initial release with Redlock algorithm implementation.
- Supports quorum-based acquire/extend/release.
- Auto-extending locks via `withLock`.
- Integrates with `@nestplatform/distribution-lock` interface.

## License

MIT
