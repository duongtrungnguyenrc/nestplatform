import { DynamicModule, Module } from "@nestjs/common";

import { ConfigurableModule } from "@nestplatform/common";

import { FeignClientModuleConfig, FeignClientModuleConfigAsync, FeignClientConfig, FeignFetcherMethod } from "../types";
import { FeignFetcherRegistry } from "../feign-fetcher.registry";
import { FetchService } from "../../fetch/fetch.service";
import { FetchInterceptorExplorer } from "../../fetch/fetch-interceptor.explorer";
import { FetchConfig } from "../../fetch/types";
import { DEFAULT_FETCH_CONFIG } from "../../fetch/fetch.constant";
import { Reflector } from "@nestjs/core";

function normalizeFetcher(fetcher: any): FeignFetcherMethod {
  if (typeof fetcher === "function") return fetcher;

  if (typeof fetcher === "object" && fetcher !== null && typeof fetcher.request === "function") {
    return fetcher.request.bind(fetcher);
  }

  throw new Error("Invalid Feign fetcher");
}

function buildFetchConfigFromFeignConfig(config: FeignClientConfig): FetchConfig {
  return {
    ...DEFAULT_FETCH_CONFIG,
    baseUrl: config.url ?? "",
    defaultHeaders: config.defaultHeaders ?? DEFAULT_FETCH_CONFIG.defaultHeaders,
    timeoutMs: config.timeoutMs ?? DEFAULT_FETCH_CONFIG.timeoutMs,
    retryCount: config.retryCount ?? DEFAULT_FETCH_CONFIG.retryCount,
    retryDelayMs: config.retryDelayMs ?? DEFAULT_FETCH_CONFIG.retryDelayMs,
    logging: config.logging ?? DEFAULT_FETCH_CONFIG.logging,
  };
}

function createDefaultFetcher(config: FeignClientConfig): FeignFetcherMethod {
  const fetchConfig = buildFetchConfigFromFeignConfig(config);
  const reflector = new Reflector();
  const interceptorExplorer = new FetchInterceptorExplorer(reflector);
  const fetchService = new FetchService(interceptorExplorer, fetchConfig);

  return fetchService.request.bind(fetchService);
}

@Module({})
export class FeignClientModule extends ConfigurableModule {
  static register(config: FeignClientModuleConfig): DynamicModule {
    let fetcher: FeignFetcherMethod;

    if (config.fetcher) {
      fetcher = normalizeFetcher(config.fetcher);
    } else {
      fetcher = createDefaultFetcher(config);
    }

    FeignFetcherRegistry.add(config.name, fetcher);

    return this.config(config, {
      module: FeignClientModule,
    });
  }

  static registerAsync(config: FeignClientModuleConfigAsync): DynamicModule {
    return this.config(config, {
      module: FeignClientModule,
      providers: [
        {
          provide: "FEIGN_CLIENT_CONFIG",
          inject: config.inject ?? [],
          useFactory: async (...deps) => {
            const feignClientConfig: FeignClientConfig = await config.useFactory(...deps);

            let fetcher: FeignFetcherMethod;

            if (feignClientConfig.fetcher) {
              fetcher = normalizeFetcher(feignClientConfig.fetcher);
            } else {
              fetcher = createDefaultFetcher(feignClientConfig);
            }

            FeignFetcherRegistry.add(feignClientConfig.name, fetcher);
          },
        },
      ],
    });
  }
}
