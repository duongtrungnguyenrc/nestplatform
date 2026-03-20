import { Inject, Injectable, Logger } from "@nestjs/common";

import {
  FetchBody,
  FetchHeaders,
  FetchConfig,
  FetchOptions,
  FetchQueryParams,
  GetOptions,
  PostOptions,
  PutOptions,
  PatchOptions,
  DeleteOptions,
  FetchPathParams,
} from "./types";
import { FetchInterceptorExplorer } from "./fetch-interceptor.explorer";
import { FETCH_CONFIG } from "./fetch.constant";
import { FetchException } from "./exceptions";
import { isPlainObject } from "@nestplatform/common";

@Injectable()
export class FetchService {
  constructor(
    private readonly fetchInterceptorExplorer: FetchInterceptorExplorer,
    @Inject(FETCH_CONFIG) private readonly config: FetchConfig,
  ) {}

  private resolvePathParams(path: string, params: FetchPathParams = {}): string {
    return path.replaceAll(/\/:([^/]+)/g, (_, key) => {
      // support for ".../:id" -> { id: ... } pattern
      const value: string | undefined | null = params[key];

      if (value === undefined || value === null) {
        throw new Error(`Missing path param: ${key}`);
      }

      return value ? `/${encodeURIComponent(String(value))}` : `/:${key}`;
    });
  }

  private buildUrl(path: string, query: FetchQueryParams = {}, params: FetchPathParams = {}) {
    const combinedPath: string = this.resolvePathParams(path.startsWith("/") ? path : `/${path}`, params);

    const full: string = `${this.config.baseUrl || ""}${combinedPath}`.replace(/([^:])\/\/+/, "$1/");
    const qs: string = this.parseQueryString(query);

    return `${full}${qs}`;
  }

  private mergeHeaders(a: FetchHeaders | undefined, b: FetchHeaders | undefined): Headers {
    const headers = new Headers();

    if (a) for (const k of Object.keys(a)) headers.set(k, (a as Record<string, string>)[k]);
    if (b) for (const k of Object.keys(b)) headers.set(k, (b as Record<string, string>)[k]);

    return headers;
  }

  private parseQueryString(query: FetchQueryParams | undefined): string {
    if (!query) return "";

    if (query instanceof URLSearchParams) return `?${query.toString()}`;
    const parts: string[] = [];

    for (const key of Object.keys(query)) {
      const val = (query as any)[key];

      if (val === undefined || val === null) continue;

      if (Array.isArray(val)) {
        for (const v of val) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      } else if (isPlainObject(val)) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(val))}`);
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
      }
    }

    return parts.length ? `?${parts.join("&")}` : "";
  }

  private safeParseRequestBody(headers: FetchHeaders, body: FetchBody | null | undefined): BodyInit | undefined {
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        // remove content-type so browser sets proper boundary
        headers.delete("Content-Type");
        return body;
      } else if (body instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return body.toString();
      } else if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
        return body as any;
      } else if (isPlainObject(body) || Array.isArray(body)) {
        headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
        return JSON.stringify(body);
      }

      // fallback to string
      return String(body);
    }
  }

  private async safeParseBody(response: Response): Promise<any> {
    const ct = response.headers.get("content-type");

    try {
      if (!ct) return await response.text();
      if (ct.includes("application/json")) return await response.json();
      if (ct.includes("text/")) return await response.text();

      // fallback: try blob then text
      try {
        const b = await response.blob();
        // best-effort convert blob to text
        return await this.blobToText(b);
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  private async parseResponseBody<T>(res: Response): Promise<T> {
    const ct = res.headers.get("content-type");

    if (!ct) return (await res.text()) as unknown as T;
    if (ct.includes("application/json")) return (await res.json()) as T;
    if (ct.includes("text/")) return (await res.text()) as unknown as T;

    // other types: return blob as unknown
    return (await res.blob()) as unknown as T;
  }

  private blobToText(b: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(b);
    });
  }

  // main request method
  public async request<T = any>(path: string, opts: FetchOptions): Promise<T> {
    const retryCount: number = opts.retryCount ?? this.config.retryCount ?? 0;
    const retryDelayMs: number = opts.retryDelayMs ?? this.config.retryDelayMs ?? 1000;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await this.executeRequest<T>(path, opts);
      } catch (err: any) {
        lastError = err;

        const isRetryable: boolean = !(err instanceof FetchException) || err.status === 0 || err.status >= 500;

        if (!isRetryable || attempt >= retryCount) {
          throw err;
        }

        if (this.config.logging !== "none") {
          Logger.warn(`Fetch retry ${attempt + 1}/${retryCount} for ${opts.method ?? "GET"} ${path} - ${err.message}`);
        }

        await this.delay(retryDelayMs);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeRequest<T = any>(path: string, opts: FetchOptions): Promise<T> {
    const url: string = this.buildUrl(path, opts.queries, opts.params);

    try {
      const controller = new AbortController();
      const timeout: number = opts.timeoutMs ?? this.config.timeoutMs;
      let timeoutId: any;

      if (timeout) timeoutId = setTimeout(() => controller.abort(), timeout);

      // merge headers
      const headers: Headers = this.mergeHeaders(this.config.defaultHeaders, opts.headers ?? {});

      // build body
      const body: BodyInit | undefined = this.safeParseRequestBody(headers, opts.body);

      const reqInit: RequestInit = {
        method: opts.method ?? "GET",
        headers,
        body,
        signal: opts.signal ?? controller.signal,
        credentials: this.config.credentials,
        mode: this.config.mode,
        cache: this.config.cache,
        redirect: this.config.redirect,
        keepalive: this.config.keepalive,
      };

      let req: Request = new Request(url, reqInit);

      // run request interceptors
      for (const interceptor of this.fetchInterceptorExplorer.getRequestInterceptors()) {
        req = await interceptor(req);
      }

      if (this.config.logging === "summary") Logger.log(`===== Started fetch operation - ${req.method} ${req.url} ======`);
      if (this.config.logging === "full")
        Logger.log(`===== Started fetch operation - ${req.method} ${req.url} ======\n${JSON.stringify(body, null, 2)}`);

      const res: Response = await fetch(req);

      // run response interceptors
      let interceptedResponse: Response = res;
      for (const interceptor of this.fetchInterceptorExplorer.getResponseInterceptors()) {
        interceptedResponse = await interceptor(interceptedResponse);
      }

      if (timeoutId) clearTimeout(timeoutId);

      if (!interceptedResponse.ok) {
        const text = await this.safeParseBody(interceptedResponse);

        throw new FetchException(`HTTP error ${interceptedResponse.status}`, interceptedResponse.status, text);
      }

      if (opts.rawResponse) return interceptedResponse as any as T;

      const parsedResponse: Awaited<T> = await this.parseResponseBody<T>(interceptedResponse);

      if (this.config.logging === "summary") Logger.log(`===== End fetch operation - ${req.method} ${req.url} - Status ${res.status} ======`);
      if (this.config.logging === "full")
        Logger.log(`===== End fetch operation - ${req.method} ${req.url} - Status ${res.status} ======\n${JSON.stringify(parsedResponse, null, 2)}`);

      return parsedResponse;
    } catch (err: any) {
      if (err?.name === "AbortError") throw new FetchException("Request aborted", 0, null);
      if (err instanceof FetchException) throw err;

      throw new FetchException(err?.message ?? "Network error", 0, null);
    }
  }

  public get<T = any>(path: string, opts: GetOptions = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: "GET" });
  }

  public post<T = any, B extends FetchBody = any>(path: string, body?: B, opts: PostOptions = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: "POST", body });
  }

  public put<T = any, B extends FetchBody = any>(path: string, body?: B, opts: PutOptions = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: "PUT", body });
  }

  public patch<T = any, B extends FetchBody = any>(path: string, body?: B, opts: PatchOptions = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: "PATCH", body });
  }

  public delete<T = any>(path: string, opts: DeleteOptions = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: "DELETE" });
  }
}
