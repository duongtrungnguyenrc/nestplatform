<p align="center">
  <a href="https://github.com/duongtrungnguyenrc/nestplatform">
    <img src="docs/assets/nestplatform-logo.svg" width="520" alt="NestPlatform" />
  </a>
</p>

<p align="center">
  NestJS support libraries for transactions, distributed locks, Redis, cache decorators, and declarative HTTP clients.
</p>

<p align="center">
  <a href="https://github.com/duongtrungnguyenrc/nestplatform/actions/workflows/package-compatibility.yml"><img src="https://img.shields.io/github/actions/workflow/status/duongtrungnguyenrc/nestplatform/package-compatibility.yml?branch=main&label=compatibility&style=flat-square" alt="Package compatibility workflow status" /></a>
  <a href="https://github.com/duongtrungnguyenrc/nestplatform/actions/workflows/transactional.yml"><img src="https://img.shields.io/github/actions/workflow/status/duongtrungnguyenrc/nestplatform/transactional.yml?branch=main&label=transactional&style=flat-square" alt="Transactional workflow status" /></a>
  <a href="https://github.com/duongtrungnguyenrc/nestplatform/actions/workflows/npm-release.yml"><img src="https://img.shields.io/github/actions/workflow/status/duongtrungnguyenrc/nestplatform/npm-release.yml?branch=main&label=release&style=flat-square" alt="NPM release workflow status" /></a>
  <a href="https://www.npmjs.com/package/@nestplatform/transactional"><img src="https://img.shields.io/npm/v/@nestplatform/transactional?style=flat-square" alt="NPM version" /></a>
  <a href="https://www.npmjs.com/package/@nestplatform/transactional"><img src="https://img.shields.io/npm/dm/@nestplatform/transactional?label=downloads%2Fmonth&style=flat-square" alt="NPM downloads per month" /></a>
  <a href="https://github.com/duongtrungnguyenrc/nestplatform/stargazers"><img src="https://img.shields.io/github/stars/duongtrungnguyenrc/nestplatform?style=flat-square" alt="GitHub stars" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/duongtrungnguyenrc/nestplatform?style=flat-square" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js >= 18" />
</p>

# @nestplatform Monorepo

This monorepo contains a collection of NestJS support libraries focused on high-level patterns and utilities.

## Packages

| Package                                | Description                                                                     | Documentation                                       |
| -------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| `@nestplatform/transactional`          | ORM-agnostic transactional management module for NestJS.                        | [README](packages/transactional/README.md)          |
| `@nestplatform/transactional-typeorm`  | TypeORM adapter for `@nestplatform/transactional`.                              | [README](packages/transactional-typeorm/README.md)  |
| `@nestplatform/transactional-mongoose` | Mongoose adapter for `@nestplatform/transactional`.                             | [README](packages/transactional-mongoose/README.md) |
| `@nestplatform/feign`                  | Declarative HTTP client library for NestJS inspired by Spring Cloud OpenFeign.  | [README](packages/feign/README.md)                  |
| `@nestplatform/cacheable`              | Spring-like declarative caching decorators for NestJS based on `cache-manager`. | [README](packages/cacheable/README.md)              |
| `@nestplatform/common`                 | Shared utilities, decorators, and base modules.                                 | [README](packages/common/README.md)                 |

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

### Release To NPM

Publishing is handled by the **NPM Release** GitHub Actions workflow.

Required repository secret:

```text
NPM_TOKEN=<npm automation token with publish access to @nestplatform>
```

Release options:

1. Run the workflow manually with `dry_run=true` to verify packaging.
2. Run the workflow manually with `dry_run=false` to publish unpublished package versions.
3. Publish a GitHub Release to trigger the same npm publish flow automatically.

The workflow builds the monorepo, runs a production audit, publishes only packages under `packages/*`, skips versions already available on npm, and uses npm provenance from GitHub Actions.

### TypeScript Compatibility

Published packages are validated against TypeScript 5 and TypeScript 6 in GitHub Actions. The transactional examples also run runtime checks against PostgreSQL and MongoDB service containers.

### Supported Versions

Published `@nestplatform/*` libraries declare NestJS packages as peer dependencies. Applications provide their own Nest runtime versions.

| Package | NestJS | Integration Package | TypeScript |
| --- | --- | --- | --- |
| `@nestplatform/common` | 8, 9, 10, 11 | n/a | 5, 6 |
| `@nestplatform/transactional` | 8, 9, 10, 11 | n/a | 5, 6 |
| `@nestplatform/transactional-typeorm` | 8, 9, 10, 11 | `@nestjs/typeorm` 9, 10, 11; TypeORM 0.3 | 5, 6 |
| `@nestplatform/transactional-mongoose` | 8, 9, 10, 11 | `@nestjs/mongoose` 9, 10, 11; Mongoose 6, 7, 8, 9 | 5, 6 |
| `@nestplatform/cacheable` | 9, 10, 11 | `@nestjs/cache-manager` 1, 2, 3; `cache-manager` 5, 6, 7 | 5, 6 |
| `@nestplatform/distribution-lock` | 8, 9, 10, 11 | n/a | 5, 6 |
| `@nestplatform/distribution-postgres-advisory-lock` | 8, 9, 10, 11 | `pg` 8 peer | 5, 6 |
| `@nestplatform/redis` | 8, 9, 10, 11 | `ioredis` 5 peer | 5, 6 |
| `@nestplatform/distribution-redlock` | 8, 9, 10, 11 | `ioredis` 5 peer | 5, 6 |
| `@nestplatform/feign` | 8, 9, 10, 11 | n/a | 5, 6 |

NestJS 12 is currently prerelease and is not included in peer ranges yet.

The compatibility matrix is enforced by GitHub Actions for published packages. Transaction examples are pinned runnable apps and use concrete NestJS 11 dependencies.

## Changelog

### Unreleased

- Added package compatibility CI for all published packages across NestJS 8, 9, 10, and 11 with TypeScript 5 and 6.
- Made integration clients application-owned peers for Redis and PostgreSQL advisory lock packages.
- Added explicit build-time dev dependencies for peer-only integration packages.
- Added transaction runtime CI for TypeORM/PostgreSQL and Mongoose/MongoDB examples.
- Ensured published libraries use NestJS packages as peer dependencies.
- Added compatibility fallbacks for older NestJS metadata scanning and decorator type surfaces.

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
