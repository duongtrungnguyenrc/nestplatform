export interface IFetchResponseInterceptor {
  intercept(response: Response): Promise<Response> | Response;
}
