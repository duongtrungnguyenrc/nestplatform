# @nestplatform/distribution-postgres-advisory-lock

A PostgreSQL advisory lock adapter for `@nestplatform/distribution-lock`, providing distributed locking using PostgreSQL's built-in session-level advisory locks.

## Features

- 🐘 **PostgreSQL Native**: Uses `pg_try_advisory_lock()` / `pg_advisory_unlock()` — no external dependencies beyond your existing database.
- 🔌 **Plug & Play**: Works as a standalone module or as a provider for `@nestplatform/distribution-lock`.
- 🔑 **String Keys**: Automatically hashes string resource keys to 64-bit integers using SHA-256.
- ⚡ **Non-Blocking**: Uses `pg_try_advisory_lock()` for immediate, non-blocking lock attempts.

## Installation

```bash
npm install @nestplatform/distribution-postgres-advisory-lock @nestplatform/distribution-lock pg
npm install -D @types/pg
```

## Usage

### Standalone Usage

Use `PgLockModule` directly without the core `DistributionLockModule`:

```typescript
import { PgLockModule } from '@nestplatform/distribution-postgres-advisory-lock';

@Module({
  imports: [
    // Option 1: Connection string
    PgLockModule.register({
      connectionString: 'postgresql://user:pass@localhost:5432/mydb',
    }),

    // Option 2: Existing Pool
    PgLockModule.register({
      pool: existingPool,
    }),
  ],
})
export class AppModule {}
```

#### Inject and use `PgLockService` directly:

```typescript
import { Injectable } from '@nestjs/common';
import { PgLockService } from '@nestplatform/distribution-postgres-advisory-lock';

@Injectable()
export class OrderService {
  constructor(private readonly lockService: PgLockService) {}

  async processOrder(orderId: string) {
    await this.lockService.withLock(
      [`order:${orderId}`],
      5000,
      async (signal) => {
        // Only one process can execute this at a time
        await this.doWork(orderId);
      },
    );
  }
}
```

### With `DistributionLockModule`

Plug into the core decorator system for declarative locking:

```typescript
import { DistributionLockModule } from '@nestplatform/distribution-lock';
import { PgLockService } from '@nestplatform/distribution-postgres-advisory-lock';

@Module({
  imports: [
    PgLockModule.register({
      connectionString: 'postgresql://user:pass@localhost:5432/mydb',
    }),
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

Then use the `@DistributionLock()` decorator:

```typescript
import { Injectable } from '@nestjs/common';
import { DistributionLock } from '@nestplatform/distribution-lock';

@Injectable()
export class PaymentService {
  @DistributionLock({ key: 'payment:process', ttl: 5000, logging: true })
  async processPayment(orderId: string) {
    // Protected by a PostgreSQL advisory lock
  }

  @DistributionLock({
    key: (args) => `payment:refund:${args[0]}`,
    ttl: 10000,
  })
  async refund(orderId: string) {
    // Lock key derived from arguments
  }
}
```

### Async Registration

```typescript
PgLockModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connectionString: config.get('DATABASE_URL'),
  }),
})
```

## How It Works

1. **Lock Acquisition**: Calls `SELECT pg_try_advisory_lock($1)` for each resource key (hashed to a 64-bit integer via SHA-256).
2. **Non-Blocking**: If the lock is already held, `ResourceLockedException` is thrown immediately — no waiting.
3. **Lock Release**: Calls `SELECT pg_advisory_unlock($1)` for each resource and returns the connection to the pool.
4. **Session Scope**: Advisory locks are session-level — they are automatically released if the database connection drops.

## Changelog

### 1.0.0
- Initial release with PostgreSQL advisory lock support via `pg`.

## License

MIT
