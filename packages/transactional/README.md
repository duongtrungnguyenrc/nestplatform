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

## Transaction Events

Handle events based on the transaction lifecycle using `@TransactionalEventListener` and `TransactionalEventPublisher`.

### 1. Publish an event
```typescript
@Injectable()
export class OrderService {
  constructor(private readonly publisher: TransactionalEventPublisher) {}

  @Transactional()
  async createOrder(data: any) {
    const order = await this.orderRepo.save(data);
    await this.publisher.publish('order.created', order); // Defer execution
    return order;
  }
}
```

### 2. Listen to events
```typescript
@Injectable()
export class NotificationService {
  @TransactionalEventListener('order.created', { phase: TransactionPhase.AFTER_COMMIT })
  async sendEmail(order: Order) {
    // Only runs if the transaction successfully commits
  }

  @TransactionalEventListener('order.created', { phase: TransactionPhase.AFTER_ROLLBACK })
  async notifySupport(order: Order) {
    // Runs only if the transaction rolls back
  }
}
```

### 3. Declarative Event Publishing
Use `@TransactionalEvent` to automatically publish the return value of a method as an event.

```typescript
@Injectable()
export class OrderService {
  @Transactional()
  @TransactionalEvent('order.created')
  async createOrder(data: any) {
    // The saved order will be automatically published as 'order.created'
    return this.orderRepo.save(data);
  }

  // Custom payload extractor
  @TransactionalEvent('order.created', { 
    payload: (result) => ({ id: result.id, status: result.status }) 
  })
  async createOrderCustom(data: any) { ... }
}
```

**Supported Phases**: `BEFORE_COMMIT`, `AFTER_COMMIT` (default), `AFTER_ROLLBACK`, `AFTER_COMPLETION`.

## Rollback Control

Fine-tune which errors trigger a rollback using the `rollbackOnError` option.

```typescript
// Rollback only on specific error classes or names
@Transactional({ rollbackOnError: [BusinessError, 'DatabaseError'] })
async process() { ... }

// Disable rollback entirely for this method
@Transactional({ rollbackOnError: false })
async logAndContinue() { ... }

// Custom predicate logic
@Transactional({ rollbackOnError: (err) => err.status >= 500 })
async apiCall() { ... }
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

## Changelog

### 1.1.1
- Added `@TransactionalEventListener` for transaction lifecycle events.
- Added `TransactionalEventPublisher` for manual and declarative event publishing.
- Added `@TransactionalEvent` decorator for automatic event publishing.
- Refined `rollbackOnError` to support error names (strings) and single class instances.
- Added `beforeCommit`, `afterCommit`, `afterRollback`, and `afterCompletion` synchronization hooks.

### 1.0.1
- Internal fixes and improvements.

### 1.0.0
- Initial release with core transactional logic and propagation support.

## License

MIT
