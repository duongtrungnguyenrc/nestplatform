# Transactional TypeORM Example

This example demonstrates `@nestplatform/transactional` v2 with TypeORM.

## What It Shows

- `TransactionalModule.registerAsync(...)` with `TypeOrmTransactionAdapter`
- class-level `@Transactional()` defaults
- method-level propagation overrides such as `REQUIRES_NEW` and `NESTED`
- `@NoTransactional()` read methods
- manual `TransactionalEventPublisher.publish(...)`
- declarative `@TransactionalEvent(...)`
- `@TransactionalEventListener(...)` phases
- TypeORM repository calls automatically routed through the active `QueryRunner`

## Runtime Requirements

- PostgreSQL
- Node.js 18+
- npm 9+

Configure database connection values in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=postgres
```

## Run

From the repository root:

```bash
npm install
npm run build -w @nestplatform/transactional
npm run build -w @nestplatform/transactional-typeorm
npm run build -w basic
```

Then start the example:

```bash
cd example/transactional-typeorm
npm run start:dev
```

## Notes

The v2 proxy behavior is owned by `@nestplatform/transactional` core. The TypeORM adapter only resolves TypeORM repositories to transaction-bound repositories from `QueryRunner.manager`.
