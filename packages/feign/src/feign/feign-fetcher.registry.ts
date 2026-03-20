import { Injectable, Logger } from "@nestjs/common";

import { defaultFeignFetcher } from "./feign.util";
import { FeignFetcherMethod } from "./types";

@Injectable()
export class FeignFetcherRegistry {
  public static readonly fetchers = new Map<string, FeignFetcherMethod>();

  public static add(name: string, fetcher: FeignFetcherMethod): void {
    FeignFetcherRegistry.fetchers.set(name, fetcher);
  }

  public add(name: string, fetcher: FeignFetcherMethod): void {
    FeignFetcherRegistry.fetchers.set(name, fetcher);
  }

  public get(name: string, useFallback = true): FeignFetcherMethod {
    const fetcher: FeignFetcherMethod | undefined = FeignFetcherRegistry.fetchers.get(name);

    if (!fetcher) {
      if (!useFallback) {
        throw new Error(`Fetcher for feign client "${name}" is not registered`);
      }

      Logger.warn(`Feign client ${name} using fall back fetcher`);
      return defaultFeignFetcher;
    }

    return fetcher;
  }
}
