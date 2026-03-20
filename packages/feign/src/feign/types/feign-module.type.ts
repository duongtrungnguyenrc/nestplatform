import { ModuleConfigAsync, ModuleConfigBase } from "@nestplatform/common";

import { FeignClientConfig } from "../types";

export type FeignClientModuleConfig = ModuleConfigBase & FeignClientConfig;

export type FeignClientModuleConfigAsync = ModuleConfigBase & ModuleConfigAsync<FeignClientConfig>;
