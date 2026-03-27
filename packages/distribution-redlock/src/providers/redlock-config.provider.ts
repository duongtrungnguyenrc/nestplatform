import { mergeWithDefaults } from "@nestplatform/common";
import { ValueProvider } from "@nestjs/common";

import { defaultRedlockConfig, REDLOCK_CONFIG } from "../redlock.constant";
import { RedlockConfig, RedlockModuleConfig } from "../redlock.type";

export const RedlockConfigProvider = (config: RedlockModuleConfig): ValueProvider<RedlockConfig> => {
  return {
    provide: REDLOCK_CONFIG,
    useValue: mergeWithDefaults(defaultRedlockConfig, config),
  };
};
