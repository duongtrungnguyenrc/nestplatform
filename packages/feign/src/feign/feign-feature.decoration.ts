import { Injectable } from "@nestjs/common";
import "reflect-metadata";

import { PlainObject } from "@nestplatform/common";

import { FeignMetadataAccessor } from "./feign-metadata.accessor";
import { FeignFetcherRegistry } from "./feign-fetcher.registry";
import { FeignClientOptions, FeignFetcherMethod, FeignMethodOptions } from "./types";

@Injectable()
export class FeignFeatureDecoration {
  constructor(
    private readonly metadataAccessor: FeignMetadataAccessor,
    private readonly fetcherRegistry: FeignFetcherRegistry,
  ) {}

  private mergeByIndexes(indexes: number[], args: any[]) {
    return indexes.reduce<Record<string, any>>((acc, idx) => {
      if (args[idx] == null) return acc;
      return { ...acc, ...args[idx] };
    }, {});
  }

  private joinPaths(...parts: (string | undefined)[]): string {
    return parts
      .filter(Boolean)
      .map((p) => p!.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/");
  }

  public decorateFetch(instance: any, originalMethod: (...args: any[]) => any, clientOptions: FeignClientOptions, options: FeignMethodOptions) {
    const { path, method } = options;

    const proto = Object.getPrototypeOf(instance);

    const paramsIdx: number[] = this.metadataAccessor.getParamsMetadata(proto, originalMethod.name) ?? [];
    const queriesIdx: number[] = this.metadataAccessor.getQueryParamsMetadata(proto, originalMethod.name) ?? [];
    const headersIdx: number[] = this.metadataAccessor.getHeaderParamsMetadata(proto, originalMethod.name) ?? [];
    const bodyIdx: number[] = this.metadataAccessor.getBodyParamsMetadata(proto, originalMethod.name) ?? [];

    instance[originalMethod.name] = async (...args: any[]) => {
      let params: PlainObject = {};
      let queries: PlainObject = {};
      let headers: PlainObject = {};
      let body: PlainObject | undefined;

      if (paramsIdx.length) {
        params = this.mergeByIndexes(paramsIdx, args);
      }

      if (queriesIdx.length) {
        queries = this.mergeByIndexes(queriesIdx, args);
      }

      if (headersIdx.length) {
        headers = this.mergeByIndexes(headersIdx, args);
      }

      if (bodyIdx.length === 1) {
        body = this.mergeByIndexes(bodyIdx, args);
      }

      const fetcher: FeignFetcherMethod = this.fetcherRegistry.get(clientOptions.name);

      if (!fetcher) {
        throw new Error(`Fetcher for feign client "${clientOptions.name}" is not registered`);
      }

      // Build final path: client path prefix + method path
      const finalPath: string = clientOptions.path ? `/${this.joinPaths(clientOptions.path, path)}` : path;

      const fetchOptions: any = {
        method,
        params,
        queries,
        headers,
        baseUrl: clientOptions.url,
        basePath: clientOptions.path,
      };

      if (body !== undefined) {
        fetchOptions.body = body;
      }

      return await fetcher(finalPath, fetchOptions);
    };
  }
}
