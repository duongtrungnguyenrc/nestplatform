import { InjectionToken, Module } from "@nestjs/common";

import { ConfigurableModule, mergeWithDefaults } from "@nestplatform/common";

import { FetchInterceptorExplorer } from "./fetch-interceptor.explorer";
import { DEFAULT_FETCH_CONFIG } from "./fetch.constant";
import { FetchConfigProvider } from "./providers";
import { FetchService } from "./fetch.service";
import { FetchModuleConfig } from "./types";

import { FeatureExplorerModule } from "@nestplatform/common";

@Module({
  imports: [FeatureExplorerModule],
  providers: [FetchInterceptorExplorer, FetchConfigProvider(DEFAULT_FETCH_CONFIG), FetchService],
  exports: [FetchService],
})
export class FetchModule extends ConfigurableModule {
  static register(config: FetchModuleConfig) {
    const injectionToken: InjectionToken = config.injectionToken || FetchService.name;

    return this.config(config, {
      module: FetchModule,
      imports: [FeatureExplorerModule],
      providers: [
        FetchInterceptorExplorer,
        FetchConfigProvider(mergeWithDefaults(DEFAULT_FETCH_CONFIG, config)),
        FetchService,
        {
          provide: injectionToken,
          useExisting: FetchService,
        },
      ],
      exports: [injectionToken],
    });
  }
}
