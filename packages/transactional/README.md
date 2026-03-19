# @nestplatform/transactional

A powerful, ORM-agnostic transaction management module for NestJS, inspired by Spring Framework's `@Transactional` annotation.

## Features

- 🚀 **Declarative Transactions**: Use `@Transactional()` decorator on classes or methods.
- 🔗 **ORM Agnostic**: Support for any ORM via a plugin-based architecture (TypeORM, etc.).
- 🌊 **Propagation Support**: Manage transaction boundaries with `REQUIRED`, `REQUIRES_NEW`, and `NESTED`.
- 🛡️ **Opt-out Support**: Easily exclude methods from class-level transactions with `@NoTransactional()`.
- 📝 **Transaction Context**: Access the active transaction/store anywhere in the call chain.
- 📜 **Logging**: Built-in logging for transaction lifecycles.

## Installation

```bash
npm install @nestplatform/transactional
```

## Usage

### 1. Register the module

You need to provide a transaction adapter for your chosen ORM (e.g., `@nestplatform/transactional-typeorm`).

```typescript
import { TransactionalModule } from '@nestplatform/transactional';
import { TypeOrmTransactionAdapter } from '@nestplatform/transactional-typeorm';

@Module({
  imports: [
    TransactionalModule.registerAsync({
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => ({
        adapters: new TypeOrmTransactionAdapter(dataSource),
        logging: true,
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Apply the decorator

Apply `@Transactional()` to your service classes or individual methods.

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional, TransactionPropagation, NoTransactional } from '@nestplatform/transactional';

@Injectable()
@Transactional() // Class-level: all methods will run in a transaction
export class OrderService {
  constructor(private readonly orderRepo: Repository<Order>) {}

  // Defaults to REQUIRED propagation
  async createOrder(data: any) {
    return this.orderRepo.save(data);
  }

  @Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })
  async createAuditLog(log: any) {
    // This runs in a SEPARATE transaction
    return this.auditRepo.save(log);
  }

  @NoTransactional() // Opt-out from class-level transaction
  async findById(id: string) {
    return this.orderRepo.findOne(id);
  }
}
```

## Propagation Levels

- **REQUIRED** (Default): Support a current transaction, create a new one if none exists.
- **REQUIRES_NEW**: Create a new transaction, suspending the current transaction if one exists.
- **NESTED**: Execute within a nested transaction if a current transaction exists (via Savepoints).

## Accessing Transaction Context

You can access the current transaction store (e.g., TypeORM QueryRunner) anywhere using `TransactionContext`.

```typescript
import { TransactionContext } from '@nestplatform/transactional';

const store = TransactionContext.getStore();
const queryRunner = store?.transaction;
```

## License

MIT
