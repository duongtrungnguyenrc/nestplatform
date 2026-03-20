# @nestplatform Monorepo

This monorepo contains a collection of NestJS support libraries focused on high-level patterns and utilities.

## Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| `@nestplatform/transactional` | ORM-agnostic transactional management module for NestJS. | [README](packages/transactional/README.md) |
| `@nestplatform/transactional-typeorm` | TypeORM adapter for `@nestplatform/transactional`. | [README](packages/transactional-typeorm/README.md) |
| `@nestplatform/transactional-mongoose` | Mongoose adapter for `@nestplatform/transactional`. | [README](packages/transactional-mongoose/README.md) |
| `@nestplatform/feign` | Declarative HTTP client library for NestJS inspired by Spring Cloud OpenFeign. | [README](packages/feign/README.md) |
| `@nestplatform/cacheable` | Spring-like declarative caching decorators for NestJS based on `cache-manager`. | [README](packages/cacheable/README.md) |
| `@nestplatform/common` | Shared utilities, decorators, and base modules. | [README](packages/common/README.md) |

## Monorepo Management

This project uses **Lerna** and **npm workspaces**.

### Prerequisites

- Node.js >= 18
- npm >= 9

### Getting Started

Install all dependencies:

```bash
npm install
```

Build all packages:

```bash
npm run build
```

## Example Projects

There are several example NestJS projects to demonstrate the usage of these libraries:

1. **`example/transactional-typeorm`**: Demonstrates @Transactional with TypeORM.
2. **`example/transactional-mongoose`**: Demonstrates @Transactional with Mongoose.
3. **`example/cacheable`**: Demonstrates declarative caching with @Cacheable, @CachePut, and @CacheEvict.
4. **`example/feign`**: Demonstrates declarative HTTP clients.
5. **`example/rest-client`**: Demonstrates advanced REST client configuration.

To run an example:

1. Build the monorepo: `npm run build`
2. Configure your environment in the example's directory if needed (e.g. `.env`)
3. Start the example: `cd example/<name> && npm run start:dev`

## License

MIT
