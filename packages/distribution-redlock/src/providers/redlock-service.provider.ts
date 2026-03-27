import { ExistingProvider } from "@nestjs/common";

import { REDLOCK_SERVICE } from "../redlock.constant";
import { RedlockService } from "../redlock.service";

export const RedlockServiceProvider: ExistingProvider<RedlockService> = {
  provide: REDLOCK_SERVICE,
  useExisting: RedlockService,
};
