import { FetchException } from "../../fetch/exceptions";
import { FetchOptions, FetchResponse } from "../../fetch";

export interface IFeignInterceptor {
  onRequest?(config: FetchOptions): any;

  onResponse?(response: FetchResponse): any;

  onRequestError?(error: FetchException): any;

  onResponseError?(error: FetchException): any;
}
