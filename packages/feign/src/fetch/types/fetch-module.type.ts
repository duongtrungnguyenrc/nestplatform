import { ModuleConfigBase, WithRequired } from "@nestplatform/common";

import { FetchConfig } from "./fetch.type";

export type FetchModuleConfig = ModuleConfigBase & WithRequired<Partial<FetchConfig>, "baseUrl">;
