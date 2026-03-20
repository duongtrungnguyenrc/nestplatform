import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IFeatureExplorer, FeatureExplorer, ProviderContext } from "@nestplatform/common";

import { FETCH_REQUEST_INTERCEPTOR, FETCH_RESPONSE_INTERCEPTOR } from "./fetch.constant";
import { IFetchRequestInterceptor, IFetchResponseInterceptor } from "./interfaces";

@Injectable()
@FeatureExplorer()
export class FetchInterceptorExplorer implements IFeatureExplorer {
  private readonly requestInterceptors: IFetchRequestInterceptor["intercept"][] = [];
  private readonly responseInterceptors: IFetchResponseInterceptor["intercept"][] = [];

  constructor(private readonly reflector: Reflector) {}

  public onProvider(context: ProviderContext): void {
    const { instance, metatype } = context;

    if (!instance || !metatype) return;

    if (this.reflector.get<boolean>(FETCH_REQUEST_INTERCEPTOR, metatype)) {
      this.requestInterceptors.push(instance.intercept.bind(instance));
    }

    if (this.reflector.get<boolean>(FETCH_RESPONSE_INTERCEPTOR, metatype)) {
      this.responseInterceptors.push(instance.intercept.bind(instance));
    }
  }

  public getRequestInterceptors() {
    return this.requestInterceptors;
  }

  public getResponseInterceptors() {
    return this.responseInterceptors;
  }
}
