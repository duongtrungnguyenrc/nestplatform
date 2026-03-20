import { PlainObject } from "@nestplatform/common";

import { IFeignFetcher } from "../interfaces";

export type FeignMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type FeignFetcherMethodOptions = {
  method: FeignMethod;
  params: PlainObject;
  queries: PlainObject;
  headers: PlainObject | Headers;
  body: PlainObject | BodyInit;
  // client-level context forwarded to fetcher
  baseUrl?: string;
  basePath?: string;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
};

export type FeignFetcherMethod = <T>(path: string, options: FeignFetcherMethodOptions) => Promise<T | void> | T | void;

export type FeignFetcher = FeignFetcherMethod | IFeignFetcher;

export type FeignClientConfig = {
  name: string;
  fetcher?: FeignFetcher; // optional — defaults to built-in FetchService
  url?: string; // base URL for this client
  path?: string; // base path prefix for all methods (e.g. "/api/v1")
  timeoutMs?: number; // per-client timeout
  defaultHeaders?: PlainObject; // default headers for all requests
  retryCount?: number; // retry count
  retryDelayMs?: number; // retry delay
  logging?: "summary" | "full" | "none"; // logging level
};

export type FeignClientOptions = {
  name: string;
  url?: string; // base URL (can be overridden at module config level)
  path?: string; // base path prefix (e.g. "/api/v1")
};

export type FeignMethodOptions = {
  path: string;
  method: FeignMethod;
};
