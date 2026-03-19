import { FactoryProvider } from "@nestjs/common";

import { DEFAULT_TRANSACTION_ADAPTER, TRANSACTION_ADAPTERS } from "../transactional.constant";
import { TransactionalModuleConfigSync } from "../types";

export const TransactionAdapterProvider = (config: TransactionalModuleConfigSync): FactoryProvider => {
  return {
    provide: TRANSACTION_ADAPTERS,
    useFactory: async () => {
      const adapters = config.adapters;

      // If single adapter (has `execute` method), wrap in default key
      return !!adapters["execute"] ? { [DEFAULT_TRANSACTION_ADAPTER]: adapters } : adapters;
    },
  };
};
