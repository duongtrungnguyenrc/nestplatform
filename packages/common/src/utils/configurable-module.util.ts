import { DynamicModule } from "@nestjs/common";

import { ModuleConfigBase } from "../common.type";
import { deepMerge } from "../common.helpers";

export abstract class ConfigurableModule {
  protected static config(config: ModuleConfigBase, moduleConfig: DynamicModule): DynamicModule {
    return deepMerge(
      {
        global: config.global,
        imports: [...(config.extraModules ? config.extraModules : [])],
        providers: [...(config.extraProviders ? config.extraProviders : [])],
        exports: [...(config.extraExports ? config.extraExports : [])],
      },
      moduleConfig,
    );
  }
}
