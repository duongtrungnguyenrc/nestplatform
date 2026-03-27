import { FactoryProvider } from "@nestjs/common";
import { Pool } from "pg";

import { PG_ADVISORY_POOL } from "../pglock.constant";
import { PgLockModuleConfigSync } from "../types";

export const PgAdvisoryPoolProvider = (config: PgLockModuleConfigSync): FactoryProvider<Pool> => ({
  provide: PG_ADVISORY_POOL,
  useFactory: () => {
    if ("pool" in config) return config.pool;
    return new Pool({ connectionString: config.connectionString });
  },
});
