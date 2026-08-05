# Transactional Mongoose Example

This example demonstrates `@nestplatform/transactional` v2 with Mongoose.

## What It Shows

- `TransactionalModule.registerAsync(...)` with `MongooseTransactionAdapter`
- `@Transactional()` methods using Mongoose models
- `REQUIRED` and `REQUIRES_NEW` propagation
- `NESTED` fallback behavior for MongoDB
- manual and declarative transactional event publishing
- `@TransactionalEventListener(...)` phases
- automatic session binding for `new Model(...)` documents and query-like static methods

## Runtime Requirements

- MongoDB replica set or sharded cluster
- Node.js 18+
- npm 9+

MongoDB transactions require a replica set or sharded cluster. A standalone MongoDB server will not support transaction commits.

## Run

From the repository root:

```bash
npm install
npm run build -w @nestplatform/transactional
npm run build -w @nestplatform/transactional-mongoose
npm run build -w mongoose-example
```

Then start the example:

```bash
cd example/transactional-mongoose
npm run start:dev
```
