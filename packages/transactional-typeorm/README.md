# @nestplatform/transactional-typeorm

TypeORM transaction adapter for `@nestplatform/transactional`, providing seamless transaction management for TypeORM in NestJS.

## Features

- 🔄 **TypeORM Integration**: Fully compatible with TypeORM's `QueryRunner` and `DataSource`.
- 🧩 **Propagation Support**: Implements `REQUIRED`, `REQUIRES_NEW`, and `NESTED` (via savepoints).
- 🧬 **Proxy Support**: Automatically intercepts repository calls and redirects them to the active transaction's manager.
- 🛡️ **Isolation Levels**: Support for custom isolation levels (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`).

## Installation

```bash
npm install @nestplatform/transactional @nestplatform/transactional-typeorm
```

## Usage

### 1. Register the adapter

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

### 2. Transaction Propagation

The adapter handles the complex logic of starting, committing, and rolling back transactions based on the propagation level specified in `@Transactional()`.

#### REQUIRED (Default)

The adapter joins an existing transaction if one is present in the `TransactionContext`, or starts a new one otherwise.

#### REQUIRES_NEW

The adapter always starts a new transaction. If one already exists, it is suspended, and the new transaction runs independently.

#### NESTED

The adapter creates a `SAVEPOINT` within the current transaction. If the nested operation fails, only that `SAVEPOINT` is rolled back, leaving the parent transaction intact.

## Under the Hood

The `TypeOrmTransactionAdapter` uses a **Proxy Pattern** on your service instances to intercept calls to TypeORM repositories. When a transaction is active, the adapter ensures that repositories use the `QueryRunner.manager` from the current transaction context instead of the global `EntityManager`.

## Changelog

### 1.1.2
- adjust to allow multi layers transactional (hexagonal, clean architecture)

### 1.1.0
- Added support for transaction synchronization hooks (`beforeCommit`, `afterCommit`, `afterRollback`, `afterCompletion`).
- Improved `shouldRollback` logic to support error names (strings) and single class instances.
- Integrated `invokeBeforeCommit` before physical commit for all propagation levels.

### 1.0.1
- Fixed TypeORM peer dependency support for NestJS 11.

### 1.0.0
- Initial release with `TypeOrmTransactionAdapter` and basic propagation support.

## License

MIT
