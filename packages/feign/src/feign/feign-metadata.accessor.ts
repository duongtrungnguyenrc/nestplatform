import { Injectable, Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import "reflect-metadata";

import { MetadataAccessor } from "@nestplatform/common";

import {
  FEIGN_METHOD_METADATA,
  FEIGN_PATH_PARAMS_METADATA,
  FEIGN_QUERY_PARAMS_METADATA,
  FEIGN_BODY_PARAMS_METADATA,
  FEIGN_HEADER_PARAMS_METADATA,
  FEIGN_CLIENT_METADATA,
} from "./feign.constant";
import { FeignClientOptions, FeignMethodOptions } from "./types";

@Injectable()
export class FeignMetadataAccessor extends MetadataAccessor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  public getFeignClientMetadata(target: Type): FeignClientOptions | undefined {
    return this.getMetadata<FeignClientOptions>(FEIGN_CLIENT_METADATA, target);
  }

  public getFeignMethodMetadata(target: any): FeignMethodOptions | undefined {
    return this.getMetadata<FeignMethodOptions>(FEIGN_METHOD_METADATA, target);
  }

  public getParamsMetadata(prototype: any, methodKey: string | symbol): number[] | undefined {
    return Reflect.getMetadata(FEIGN_PATH_PARAMS_METADATA, prototype, methodKey);
  }

  public getQueryParamsMetadata(prototype: any, methodKey: string | symbol): number[] | undefined {
    return Reflect.getMetadata(FEIGN_QUERY_PARAMS_METADATA, prototype, methodKey);
  }

  public getHeaderParamsMetadata(prototype: any, methodKey: string | symbol): number[] | undefined {
    return Reflect.getMetadata(FEIGN_HEADER_PARAMS_METADATA, prototype, methodKey);
  }

  public getBodyParamsMetadata(prototype: any, methodKey: string | symbol): number[] | undefined {
    return Reflect.getMetadata(FEIGN_BODY_PARAMS_METADATA, prototype, methodKey);
  }
}
