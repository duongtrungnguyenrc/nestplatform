import { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";
import { ITransactionAdapter } from "../interfaces";
export type TransactionalModuleConfig = {
    adapters: ITransactionAdapter | Record<string, ITransactionAdapter>;
};
export type TransactionalModuleConfigSync = Omit<ModuleConfigBase, "global"> & TransactionalModuleConfig;
export type TransactionalModuleConfigAsync = Omit<ModuleConfigBase, "global"> & ModuleConfigAsync<TransactionalModuleConfig>;
