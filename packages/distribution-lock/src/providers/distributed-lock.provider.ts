import { FactoryProvider } from "@nestjs/common";

import { DEFAULT_DISTRIBUTION_PROVIDER, DISTRIBUTION_LOCK_SERVICES } from "../distribution-lock.constant";
import { DistributionModuleConfigSync } from "../types";

export const DistributedLockProvider = (config: DistributionModuleConfigSync): FactoryProvider => {
  return {
    provide: DISTRIBUTION_LOCK_SERVICES,
    useFactory: async () => {
      const providers = config.providers;

      return !!providers["acquire"] ? { [DEFAULT_DISTRIBUTION_PROVIDER]: providers } : providers;
    },
  };
};
