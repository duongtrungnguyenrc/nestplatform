import { ExistingProvider } from "@nestjs/common";

import { PGLOCK_SERVICE } from "../pglock.constant";
import { PgLockService } from "../pglock.service";

export const PgLockServiceProvider: ExistingProvider<PgLockService> = {
  provide: PGLOCK_SERVICE,
  useExisting: PgLockService,
};
