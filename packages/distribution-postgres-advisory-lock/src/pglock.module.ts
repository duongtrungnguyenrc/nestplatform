import { ConfigurableModule } from "@nestplatform/common";
import { DynamicModule, Module } from "@nestjs/common";

import { PgAdvisoryPoolAsyncProvider, PgAdvisoryPoolProvider, PgLockServiceProvider } from "./providers";
import { PgLockModuleConfigSync, PgLockModuleConfigAsync } from "./types";
import { PGLOCK_SERVICE } from "./pglock.constant";
import { PgLockService } from "./pglock.service";

/**
 * Module that provides PostgreSQL advisory lock-based distributed locking.
 *
 * Registers a `PgLockService` that implements `IDistributedLockService` using
 * PostgreSQL's session-level advisory locks (`pg_try_advisory_lock` / `pg_advisory_unlock`).
 *
 * Can be used standalone or plugged into `DistributionLockModule` as a lock provider.
 *
 * @example
 * ```typescript
 * // Using a connection string
 * PgLockModule.register({
 *   connectionString: 'postgresql://user:pass@localhost:5432/mydb',
 * })
 *
 * // Using an existing Pool instance
 * PgLockModule.register({
 *   pool: existingPool,
 * })
 *
 * // Async registration
 * PgLockModule.registerAsync({
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     connectionString: config.get('DATABASE_URL'),
 *   }),
 * })
 * ```
 */
@Module({})
export class PgLockModule extends ConfigurableModule {
  static register(config: PgLockModuleConfigSync): DynamicModule {
    return super.config(config, {
      global: true,
      module: PgLockModule,
      providers: [PgAdvisoryPoolProvider(config), PgLockService, PgLockServiceProvider],
      exports: [PgLockService, PGLOCK_SERVICE],
    });
  }

  static registerAsync(config: PgLockModuleConfigAsync): DynamicModule {
    return super.config(config, {
      global: true,
      module: PgLockModule,
      providers: [PgAdvisoryPoolAsyncProvider(config), PgLockService, PgLockServiceProvider],
      exports: [PgLockService, PGLOCK_SERVICE],
    });
  }
}
