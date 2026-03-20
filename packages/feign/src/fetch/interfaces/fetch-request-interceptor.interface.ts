export interface IFetchRequestInterceptor {
  intercept(request: Request): Promise<Request> | Request;
}
