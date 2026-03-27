# @nestplatform/distribution-lock

A powerful, backend-agnostic distributed lock module for NestJS, inspired by distributed locking patterns used in microservice architectures.

## Features

- 🔒 **Declarative Locking**: Use `@DistributionLock()` decorator on methods to automatically acquire/release distributed locks.
- 🔌 **Backend Agnostic**: Support for any locking backend via a plugin-based architecture (Redis, PostgreSQL, etc.).
- 🔑 **Dynamic Lock Keys**: Derive lock keys from method arguments using a callback function.
- ⏱️ **TTL Support**: Configure time-to-live for each lock to prevent deadlocks.
- 📝 **Logging**: Built-in lifecycle logging for lock acquisition and release.
- 🛡️ **Multiple Providers**: Register multiple lock providers and select per-method.

## Installation

```bash
npm install @nestplatform/distribution-lock
```

## Usage

### 1. Register the module

You need to provide a lock service implementation for your chosen backend (e.g., `@nestplatform/distribution-postgres-advisory`).

```typescript
import { DistributionLockModule } from '@nestplatform/distribution-lock';
import { PgLockService } from '@nestplatform/distribution-postgres-advisory';

@Module({
  imports: [
    DistributionLockModule.registerAsync({
      inject: [PgLockService],
      useFactory: (pgLockService: PgLockService) => ({
        providers: pgLockService,
      }),
    }),
  ],
})
export class AppModule {}
```

#### Multiple providers

```typescript
DistributionLockModule.register({
  providers: {
    default: pgLockService,
    redis: redisLockService,
  },
})
```

### 2. Apply the decorator

Apply `@DistributionLock()` to your service methods.

```typescript
import { Injectable } from '@nestjs/common';
import { DistributionLock } from '@nestplatform/distribution-lock';

@Injectable()
export class PaymentService {
  @DistributionLock({ key: 'payment:process', ttl: 5000, logging: true })
  async processPayment(orderId: string) {
    // Only one instance can execute this at a time
  }

  @DistributionLock({
    key: (args) => `payment:refund:${args[0]}`,
    ttl: 10000,
    provider: 'redis', // Use a specific provider
  })
  async refund(orderId: string) {
    // Lock key is derived from method arguments
  }
}
```

## Decorator Options

| Option     | Type                                      | Description                                                |
|------------|-------------------------------------------|------------------------------------------------------------|
| `key`      | `string \| ((args: any[]) => string)`     | The lock key — static or derived from method arguments     |
| `ttl`      | `number`                                  | Lock time-to-live in milliseconds                          |
| `provider` | `string`                                  | Name of the lock provider to use (defaults to `"default"`) |
| `logging`  | `boolean`                                 | Enable lifecycle logging for this lock                     |

## Creating a Custom Lock Provider

Implement the `IDistributedLockService` interface to create your own backend:

```typescript
import { IDistributedLockService, DistributedLock, ExecutionResult, DistributedLockAbortSignal } from '@nestplatform/distribution-lock';
import { EventEmitter } from 'events';

export class MyCustomLockService implements IDistributedLockService {
  async acquire(resources: string[], duration: number): Promise<DistributedLock> { /* ... */ }
  async extend(handle: DistributedLock, duration: number): Promise<DistributedLock> { /* ... */ }
  async release(handle: DistributedLock): Promise<ExecutionResult> { /* ... */ }
  async withLock<T>(
    resources: string[],
    duration: number,
    handler: (signal: DistributedLockAbortSignal) => Promise<T>,
    eventHandler?: (emitter: EventEmitter) => void,
  ): Promise<T> { /* ... */ }
}
```

## Available Backend Adapters

| Package                                       | Backend                      |
|-----------------------------------------------|------------------------------|
| `@nestplatform/distribution-postgres-advisory` | PostgreSQL Advisory Locks    |
| `@nestplatform/distribution-redlock`           | Redis (Redlock algorithm)    |

## Changelog

### 1.0.0
- Initial release with core distributed lock logic, decorator, and plugin-based architecture.

## License

MIT
