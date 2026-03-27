import { FactoryProvider } from "@nestjs/common";

import { mergeWithDefaults } from "@nestplatform/common";

import { defaultRedlockConfig, REDLOCK_CONFIG } from "../redlock.constant";
import { RedlockConfig, RedlockModuleConfigAsync } from "../redlock.type";

export const RedlockConfigAsyncProvider = (config: RedlockModuleConfigAsync): FactoryProvider<RedlockConfig> => {
  return {
    provide: REDLOCK_CONFIG,
    inject: config.inject,
    useFactory: async (...args) => mergeWithDefaults(defaultRedlockConfig, await config.useFactory(...args)),
  };
};
