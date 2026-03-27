import { FactoryProvider } from "@nestjs/common";
import { Pool } from "pg";

import { PgLockModuleConfig, PgLockModuleConfigAsync } from "../types";
import { PG_ADVISORY_POOL } from "../pglock.constant";

export const PgAdvisoryPoolAsyncProvider = (config: PgLockModuleConfigAsync): FactoryProvider<Pool> => ({
  provide: PG_ADVISORY_POOL,
  inject: config.inject,
  useFactory: async (...args) => {
    const moduleConfig: PgLockModuleConfig = await config.useFactory(...args);

    if ("pool" in moduleConfig) return moduleConfig.pool;
    return new Pool({ connectionString: moduleConfig.connectionString });
  },
});
