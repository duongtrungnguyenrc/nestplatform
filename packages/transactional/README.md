# @nestplatform/transactional

A powerful, ORM-agnostic transaction management module for NestJS, inspired by Spring Framework's `@Transactional` annotation.

## Features

- **Declarative Transactions**: Use `@Transactional()` decorator on classes or methods.
- **ORM Agnostic**: Support for any ORM via a plugin-based architecture (TypeORM, etc.).
- **Propagation Support**: Manage transaction boundaries with `REQUIRED`, `REQUIRES_NEW`, and `NESTED`.
- **Opt-out Support**: Easily exclude methods from class-level transactions with `@NoTransactional()`.
- **Transaction Context**: Access the active transaction/store anywhere in the call chain.
- **Core-managed Proxying**: Transactional core owns recursive proxy traversal and delegates only ORM resource resolution to adapters.
- **Logging**: Built-in logging for transaction lifecycles.
- **TypeScript 5/6 Support**: Transaction packages are validated against TypeScript 5 and TypeScript 6.

## Supported Versions

| Dependency | Supported Versions |
| --- | --- |
| NestJS `@nestjs/common` | 8, 9, 10, 11 |
| NestJS `@nestjs/core` | 8, 9, 10, 11 |
| `reflect-metadata` | 0.1, 0.2 |
| TypeScript | 5, 6 |

NestJS packages are intentionally peer dependencies so applications provide their own Nest runtime.

NestJS 12 is currently prerelease and is not included in the peer range yet.

## Installation

### Install transactional package

```bash
npm install @nestplatform/transactional
```

### Install adapters

1. Typeorm adapter

```bash
npm install @nestplatform/transactional-typeorm
```

2. Mongoose adapter

```bash
npm install @nestplatform/transactional-mongoose
```

## Usage

### 1. Register the module

You need to provide a transaction adapter for your chosen ORM (e.g., `@nestplatform/transactional-typeorm`).

```typescript
import { TransactionalModule } from "@nestplatform/transactional";
import { TypeOrmTransactionAdapter } from "@nestplatform/transactional-typeorm";

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

### Adapter contract for custom ORMs

`@nestplatform/transactional` v2 makes proxy behavior a core responsibility. Custom adapters must implement the required `ITransactionAdapter.proxyResource(...)` hook and keep recursive proxy traversal out of the adapter.

```typescript
import { ITransactionAdapter, TransactionExecuteOptions, TransactionProxyContext, TransactionProxyResource } from "@nestplatform/transactional";

export class CustomTransactionAdapter implements ITransactionAdapter {
  proxyResource(value: any, context: TransactionProxyContext): TransactionProxyResource | undefined {
    if (!isCustomRepository(value)) {
      return undefined;
    }

    const transaction = this.getActiveTransaction();
    if (!transaction) {
      return { value };
    }

    return { value: value.bindToTransaction(transaction) };
  }

  async execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    // Start/reuse/commit/rollback using your ORM.
  }

  getActiveTransaction(): any | undefined {
    // Return the active transaction handle from TransactionContext.
  }
}
```

Return `undefined` when the value is not handled by the adapter. Return `{ value }` to either replace an ORM resource with its transaction-bound equivalent, or to mark an ORM internal object as handled so the core proxy does not traverse it.

### 2. Apply the decorator

Apply `@Transactional()` to your service classes or individual methods.

```typescript
import { Injectable } from "@nestjs/common";
import { Transactional, TransactionPropagation, NoTransactional } from "@nestplatform/transactional";

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
    await this.publisher.publish("order.created", order); // Defer execution
    return order;
  }
}
```

### 2. Listen to events

```typescript
@Injectable()
export class NotificationService {
  @TransactionalEventListener("order.created", { phase: TransactionPhase.AFTER_COMMIT })
  async sendEmail(order: Order) {
    // Only runs if the transaction successfully commits
  }

  @TransactionalEventListener("order.created", { phase: TransactionPhase.AFTER_ROLLBACK })
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
import { TransactionContext } from "@nestplatform/transactional";

const store = TransactionContext.getStore();
const queryRunner = store?.transaction;
```

## How Proxying Works

The transactional core creates a proxy around the decorated provider before executing the original method. The core handles:

- recursive traversal through nested services and objects
- method `this` binding
- proxy caching with `WeakMap`
- skipping built-in objects such as `Promise`, `Date`, `Map`, `Set`, arrays, and buffers
- delegating ORM-specific resources to `adapter.proxyResource(...)`

Adapters should not implement recursive service proxying. They should only detect and replace their own resources, such as TypeORM repositories or Mongoose models.

## Changelog

### 2.0.0

- Moved recursive proxy orchestration into `@nestplatform/transactional` core.
- Replaced optional adapter `proxyInstance?` traversal with required `proxyResource(...)` resource resolution.
- Kept propagation, rollback, event, and transaction context behavior unchanged.
- Added TypeScript 5 and TypeScript 6 validation for transaction packages.
- Added CI runtime verification through the TypeORM/PostgreSQL and Mongoose/MongoDB examples.
- Widened NestJS peer dependency support to stable majors 8 through 11.

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
