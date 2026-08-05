# @nestplatform/common

Shared utilities, decorators, and feature-explorer infrastructure used by the `@nestplatform/*` packages.

## Supported Versions

| Dependency | Supported Versions |
| --- | --- |
| NestJS `@nestjs/common` | 8, 9, 10, 11 |
| NestJS `@nestjs/core` | 8, 9, 10, 11 |
| `reflect-metadata` | 0.1, 0.2 |
| TypeScript | 5, 6 |

NestJS packages are peer dependencies. Applications provide the concrete Nest runtime versions.

NestJS 12 is currently prerelease and is not included in peer ranges yet.

## Changelog

### Unreleased

- Widened NestJS peer dependency support to stable majors 8 through 11.
- Added compatibility fallbacks for older NestJS `MetadataScanner` APIs.
- Added a fallback for NestJS versions without `DiscoveryService.createDecorator()`.

## License

MIT
