# @nestplatform/transactional-mongoose

Mongoose adapter for `@nestplatform/transactional`.

## Installation

```bash
npm install @nestplatform/transactional @nestplatform/transactional-mongoose
```

## Supported Versions

| Dependency | Supported Versions |
| --- | --- |
| NestJS `@nestjs/common` | 8, 9, 10, 11 |
| NestJS `@nestjs/core` | 8, 9, 10, 11 |
| `@nestjs/mongoose` | 9, 10, 11 |
| Mongoose | 6, 7, 8, 9 |
| TypeScript | 5, 6 |

NestJS packages are peer dependencies; your application owns the concrete Nest runtime versions.

NestJS 12 is currently prerelease and is not included in the peer range yet.

## Basic Usage

### 1. Register the module

```typescript
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { TransactionalModule } from "@nestplatform/transactional";
import { MongooseTransactionAdapter } from "@nestplatform/transactional-mongoose";

@Module({
  imports: [
    TransactionalModule.registerAsync({
      inject: [getConnectionToken()],
      useFactory: (connection: Connection) => ({
        adapters: new MongooseTransactionAdapter(connection),
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Use `@Transactional` in your services

```typescript
@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

  @Transactional()
  async createOrder(productName: string, amount: number) {
    const order = new this.orderModel({ productName, amount });
    return order.save();
  }
}
```

## Features

- **Propagation Support**: Supports `REQUIRED` and `REQUIRES_NEW`. `NESTED` falls back to `REQUIRED` (not natively supported by MongoDB).
- **Core Proxy Support**: Transactional core walks services and delegates Mongoose model/session binding to this adapter.
- **Auto-session binding**: Automatically attaches the active session to model constructors and query-like static method results.
- **Synchronizations**: Supports `afterCommit`, `afterRollback`, and `afterCompletion` hooks.

## Prerequisites

- MongoDB replica set or sharded cluster (required for transactions).
- NestJS with `@nestjs/mongoose`.

## Under the Hood

In v2, `@nestplatform/transactional` core owns recursive proxying, method binding, and proxy caching. `MongooseTransactionAdapter` implements only Mongoose-specific resource resolution:

- leaves Mongoose `Connection` and `ClientSession` internals untouched
- detects Mongoose models
- returns the original model when no transaction is active
- attaches the active `ClientSession` to `new Model(...)` documents
- adds the active `ClientSession` to immediate static writes such as `Model.create(...)`, `Model.insertMany(...)`, and `Model.bulkWrite(...)`
- attaches the active `ClientSession` to query-like static method results with `.session(...)`

MongoDB does not support savepoints, so `TransactionPropagation.NESTED` logs a warning and falls back to `REQUIRED`.

## Changelog

### 2.0.0

- Updated for `@nestplatform/transactional` v2.
- Removed adapter-owned recursive proxy traversal.
- Implemented required `proxyResource(...)` resource resolution for Mongoose models.
- Preserved session lifecycle, rollback, synchronization, and propagation behavior.
- Added MongoDB replica-set runtime verification in transaction CI.
- Widened NestJS peer dependency support to stable majors 8 through 11.

### 1.1.2

- adjust to allow multi layers transactional (hexagonal, clean architecture)

### 1.0.0

- release first version supporting for mongoose

## License

MIT
