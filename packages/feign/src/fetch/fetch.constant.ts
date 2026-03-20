import { FetchConfig } from "./types";

export const FETCH_REQUEST_INTERCEPTOR = Symbol("metadata:fetch-request-interceptor");
export const FETCH_RESPONSE_INTERCEPTOR = Symbol("metadata:fetch-response-interceptor");

export const FETCH_CONFIG = Symbol("token:fetch-config");

export const DEFAULT_FETCH_CONFIG: Omit<FetchConfig, "baseUrl"> = {
  defaultHeaders: {},
  timeoutMs: 5000,
  retryCount: 0,
  retryDelayMs: 1000,
  credentials: "same-origin",
  logging: "summary",
};
