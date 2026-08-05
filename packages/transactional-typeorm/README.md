# @nestplatform/transactional-typeorm

TypeORM transaction adapter for `@nestplatform/transactional`, providing seamless transaction management for TypeORM in NestJS.

## Features

- **TypeORM Integration**: Fully compatible with TypeORM's `QueryRunner` and `DataSource`.
- **Propagation Support**: Implements `REQUIRED`, `REQUIRES_NEW`, and `NESTED` (via savepoints).
- **Core Proxy Support**: Transactional core walks services and delegates TypeORM repository replacement to this adapter.
- **Isolation Levels**: Support for custom isolation levels (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`).

## Installation

```bash
npm install @nestplatform/transactional @nestplatform/transactional-typeorm
```

## Supported Versions

| Dependency | Supported Versions |
| --- | --- |
| NestJS `@nestjs/common` | 8, 9, 10, 11 |
| NestJS `@nestjs/core` | 8, 9, 10, 11 |
| `@nestjs/typeorm` | 9, 10, 11 |
| TypeORM | 0.3 |
| TypeScript | 5, 6 |

NestJS packages are peer dependencies; your application owns the concrete Nest runtime versions.

TypeORM is also a peer dependency so applications control the database integration version. TypeORM 1.x is not listed until its NestJS adapter support is stable.

NestJS 12 is currently prerelease and is not included in the peer range yet.

## Usage

### 1. Register the adapter

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

### 2. Transaction Propagation

The adapter handles the complex logic of starting, committing, and rolling back transactions based on the propagation level specified in `@Transactional()`.

#### REQUIRED (Default)

The adapter joins an existing transaction if one is present in the `TransactionContext`, or starts a new one otherwise.

#### REQUIRES_NEW

The adapter always starts a new transaction. If one already exists, it is suspended, and the new transaction runs independently.

#### NESTED

The adapter creates a `SAVEPOINT` within the current transaction. If the nested operation fails, only that `SAVEPOINT` is rolled back, leaving the parent transaction intact.

## Under the Hood

In v2, `@nestplatform/transactional` core owns the service proxy. It recursively walks decorated providers, nested services, and plain objects while preserving method binding and caching proxies.

`TypeOrmTransactionAdapter` only implements TypeORM-specific resource resolution:

- leaves `DataSource` and `QueryRunner` internals untouched
- detects TypeORM repositories by their `metadata` and `manager` fields
- returns the original repository when no transaction is active
- returns `queryRunner.manager.getRepository(...)` while a transaction is active

This keeps transaction behavior the same while making adapter maintenance smaller and more predictable.

## Changelog

### 2.0.0

- Updated for `@nestplatform/transactional` v2.
- Removed adapter-owned recursive proxy traversal.
- Implemented required `proxyResource(...)` resource resolution for TypeORM repositories.
- Preserved `REQUIRED`, `REQUIRES_NEW`, `NESTED`, isolation, rollback, and synchronization behavior.
- Added PostgreSQL-backed runtime verification in transaction CI.
- Widened NestJS peer dependency support to stable majors 8 through 11.
- Narrowed TypeORM peer support to the verified 0.3 line.

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
