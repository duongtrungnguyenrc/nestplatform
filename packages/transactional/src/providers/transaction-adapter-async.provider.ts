import { FactoryProvider } from "@nestjs/common";

import { DEFAULT_TRANSACTION_ADAPTER, TRANSACTION_ADAPTERS } from "../transactional.constant";
import { TransactionalModuleConfigAsync } from "../types";

export const TransactionAdapterAsyncProvider = (config: TransactionalModuleConfigAsync): FactoryProvider => {
  return {
    provide: TRANSACTION_ADAPTERS,
    inject: config.inject,
    useFactory: async (...args) => {
      const { adapters } = await config.useFactory(...args);

      // If single adapter (has `execute` method), wrap in default key
      return !!adapters["execute"] ? { [DEFAULT_TRANSACTION_ADAPTER]: adapters } : adapters;
    },
  };
};
