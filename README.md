# @nestplatform Monorepo

This monorepo contains a collection of NestJS support libraries focused on high-level patterns and utilities.

## Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| `@nestplatform/transactional` | ORM-agnostic transactional management module for NestJS. | [README](packages/transactional/README.md) |
| `@nestplatform/transactional-typeorm` | TypeORM adapter for `@nestplatform/transactional`. | [README](packages/transactional-typeorm/README.md) |
| `@nestplatform/common` | Shared utilities, decorators, and base modules. | [README](packages/common/README.md) |

## Monorepo Management

This project uses **Lerna** and **npm workspaces**.

### Prerequisites

- Node.js >= 18
- npm >= 9

### Getting Started

Install all dependencies:

```bash
npm install --legacy-peer-deps
```

Build all packages:

```bash
npm run build
```

## Example Project

There is a placeholder NestJS project in the `example/basic` directory to demonstrate the usage of these libraries.

To run the example:

1. Build the monorepo: `npm run build`
2. Configure your environment in `example/basic/.env` (Database credentials)
3. Start the example: `cd example/basic && npm run start:dev`

## License

MIT
