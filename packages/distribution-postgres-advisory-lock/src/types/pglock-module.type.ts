import { Pool } from "pg";

import { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";

/**
 * Configuration for the `PgLockModule`.
 *
 * Provide either an existing `Pool` instance or a `connectionString`
 * to create a new pool automatically.
 */
export type PgLockModuleConfig =
  | {
      /** An existing `pg.Pool` instance to use for advisory locks. */
      pool: Pool;
    }
  | {
      /** A PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`). */
      connectionString: string;
    };

/** Synchronous configuration for `PgLockModule.register()`. */
export type PgLockModuleConfigSync = ModuleConfigBase & PgLockModuleConfig;

/** Asynchronous configuration for `PgLockModule.registerAsync()`. */
export type PgLockModuleConfigAsync = ModuleConfigBase & ModuleConfigAsync<PgLockModuleConfig>;
