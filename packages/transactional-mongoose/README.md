# @nestplatform/transactional-mongoose

Mongoose adapter for `@nestplatform/transactional`.

## Installation

```bash
npm install @nestplatform/transactional @nestplatform/transactional-mongoose
```

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
- **Auto-session binding**: Automatically attaches the active session to Mongoose model queries within the transaction context.
- **Synchronizations**: Supports `afterCommit`, `afterRollback`, and `afterCompletion` hooks.

## Prerequisites

- MongoDB replica set or sharded cluster (required for transactions).
- NestJS with `@nestjs/mongoose`.

## Changelog

### 1.1.2
- adjust to allow multi layers transactional (hexagonal, clean architecture)

### 1.0.0
- release first version supporting for mongoose

