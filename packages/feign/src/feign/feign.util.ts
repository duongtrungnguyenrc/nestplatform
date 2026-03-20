import { PlainObject } from "@nestplatform/common";

import { FeignFetcherMethod, FeignFetcherMethodOptions } from "./types";

function buildUrl(path: string, params: PlainObject = {}, queries: PlainObject = {}): string {
  let url: string = path;

  for (const [key, value] of Object.entries(params)) {
    url = url.replaceAll(new RegExp(String.raw`:${key}\b`, "g"), encodeURIComponent(String(value)));
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(queries)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  }

  const queryString: string = search.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function normalizeHeaders(headers?: PlainObject | Headers, body?: any): Headers {
  if (headers instanceof Headers) return headers;

  const h = new Headers(headers);

  if (body && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !h.has("content-type")) {
    h.set("content-type", "application/json");
  }

  return h;
}

function normalizeBody(body?: PlainObject | BodyInit): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  if (contentType.includes("text/")) {
    return (await response.text()) as any;
  }

  return (await response.arrayBuffer()) as any;
}

export const defaultFeignFetcher: FeignFetcherMethod = async <T = any>(path: string, options: FeignFetcherMethodOptions): Promise<T | void> => {
  const { method, params, queries, headers, body, baseUrl } = options;

  const resolvedPath: string = buildUrl(path, params, queries);
  const url: string = baseUrl ? `${baseUrl.replace(/\/+$/, "")}${resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`}` : resolvedPath;

  const response: Response = await fetch(url, {
    method,
    headers: normalizeHeaders(headers, body),
    body: normalizeBody(body),
  });

  if (!response.ok) {
    const text: string = await response.text();

    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
  }

  return parseResponse<T>(response);
};
