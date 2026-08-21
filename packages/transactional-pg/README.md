# @nestplatform/transactional-pg

PG adapter for `@nestplatform/transactional`, backed by the `pg` package.

## Installation

```bash
npm install @nestplatform/transactional @nestplatform/transactional-pg pg
```

## Basic Usage

### 1. Register the adapter

```typescript
import { Module } from "@nestjs/common";
import { Pool } from "pg";
import { TransactionalModule } from "@nestplatform/transactional";
import { PgTransactionAdapter } from "@nestplatform/transactional-pg";

@Module({
  providers: [
    {
      provide: Pool,
      useFactory: () => new Pool({ connectionString: process.env.DATABASE_URL }),
    },
  ],
  imports: [
    TransactionalModule.registerAsync({
      inject: [Pool],
      useFactory: (pool: Pool) => ({
        adapters: new PgTransactionAdapter(pool),
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Use `@Transactional` in your services

```typescript
import { Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { Transactional } from "@nestplatform/transactional";

@Injectable()
export class OrderService {
  constructor(private readonly pool: Pool) {}

  @Transactional({ adapter: "pg" })
  async createOrder(productName: string, amount: number) {
    const result = await this.pool.query("INSERT INTO orders(product_name, amount) VALUES($1, $2) RETURNING *", [productName, amount]);

    return result.rows[0];
  }
}
```

## Features

- **Propagation Support**: Supports `REQUIRED`, `REQUIRES_NEW`, and `NESTED` via PostgreSQL savepoints.
- **Auto-client binding**: Calls to injected `Pool.query()` and `Pool.connect()` use the active transaction client.
- **Isolation Levels**: Supports `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE`.
- **Synchronizations**: Supports `beforeCommit`, `afterCommit`, `afterRollback`, and `afterCompletion` hooks.

## License

MIT
