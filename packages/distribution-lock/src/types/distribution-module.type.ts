import { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";
import { IDistributedLockService } from "../interfaces";

/**
 * Base configuration for the distribution lock module.
 *
 * @property providers - A single lock service instance (registered as `"default"`)
 *                       or a map of named lock service instances
 */
export type DistributionModuleConfig = {
  providers: IDistributedLockService | Record<string, IDistributedLockService>;
};

/** Synchronous configuration for `DistributionLockModule.register()`. */
export type DistributionModuleConfigSync = Omit<ModuleConfigBase, "global"> & DistributionModuleConfig;

/** Asynchronous configuration for `DistributionLockModule.registerAsync()`. */
export type DistributionModuleConfigAsync = Omit<ModuleConfigBase, "global"> & ModuleConfigAsync<DistributionModuleConfig>;
