import { InjectionToken } from "@nestjs/common";

import { PlainObject } from "@nestplatform/common";

import { IFetchRequestInterceptor, IFetchResponseInterceptor } from "../interfaces";

export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type FetchHeaders = Headers | PlainObject;
export type FetchBody = BodyInit | PlainObject;
export type FetchQueryParams = PlainObject | URLSearchParams;
export type FetchPathParams = PlainObject;

export type FetchOptions = {
  method: FetchMethod;
  headers?: FetchHeaders;
  body?: FetchBody;
  queries?: FetchQueryParams;
  params?: FetchPathParams;
  timeoutMs?: number; // override client default
  retryCount?: number; // override client default retry count
  retryDelayMs?: number; // override client default retry delay
  signal?: AbortSignal;
  rawResponse?: boolean; // if true, don't parse JSON automatically
};

export type GetOptions = Omit<FetchOptions, "method" | "body">;
export type PostOptions = Omit<FetchOptions, "method">;
export type PutOptions = Omit<FetchOptions, "method">;
export type DeleteOptions = Omit<FetchOptions, "method" | "body">;
export type PatchOptions = Omit<FetchOptions, "method">;

export type FetchRequestInterceptor = IFetchRequestInterceptor | IFetchRequestInterceptor["intercept"] | InjectionToken<IFetchRequestInterceptor>;
export type FetchResponseInterceptor = IFetchResponseInterceptor | IFetchResponseInterceptor["intercept"] | InjectionToken<IFetchResponseInterceptor>;

export type FetchResponse = Response;

export type FetchConfig = {
  baseUrl: string;
  defaultHeaders: FetchHeaders;
  timeoutMs: number;
  retryCount: number; // number of retries on failure (0 = no retry)
  retryDelayMs: number; // delay in ms between retries
  credentials?: RequestCredentials; // "include" | "same-origin" | "omit"
  mode?: RequestMode; // "cors" | "no-cors" | "same-origin"
  cache?: RequestCache; // request cache policy
  redirect?: RequestRedirect; // "follow" | "error" | "manual"
  keepalive?: boolean;
  requestInterceptors?: FetchRequestInterceptor[];
  responseInterceptors?: FetchResponseInterceptor[];
  logging?: "summary" | "full" | "none"; // summary mode will include path, method, response code. use full when want to show full payload or none to disable
};
