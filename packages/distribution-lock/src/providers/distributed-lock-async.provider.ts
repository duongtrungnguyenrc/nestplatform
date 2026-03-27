import { FactoryProvider } from "@nestjs/common";

import { DEFAULT_DISTRIBUTION_PROVIDER, DISTRIBUTION_LOCK_SERVICES } from "../distribution-lock.constant";
import { DistributionModuleConfigAsync } from "../types";

export const DistributedLockAsyncProvider = (config: DistributionModuleConfigAsync): FactoryProvider => {
  return {
    provide: DISTRIBUTION_LOCK_SERVICES,
    inject: config.inject,
    useFactory: async (...args) => {
      const { providers } = await config.useFactory(...args);

      return !!providers["acquire"] ? { [DEFAULT_DISTRIBUTION_PROVIDER]: providers } : providers;
    },
  };
};
