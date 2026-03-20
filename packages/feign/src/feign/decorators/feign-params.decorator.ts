import "reflect-metadata";

import { FEIGN_BODY_PARAMS_METADATA, FEIGN_HEADER_PARAMS_METADATA, FEIGN_PATH_PARAMS_METADATA, FEIGN_QUERY_PARAMS_METADATA } from "../feign.constant";

export const Params = (): ParameterDecorator => {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: number[] = Reflect.getOwnMetadata(FEIGN_PATH_PARAMS_METADATA, target, propertyKey) || [];

    existingParams.push(parameterIndex);
    Reflect.defineMetadata(FEIGN_PATH_PARAMS_METADATA, existingParams, target, propertyKey);
  };
};

export const Queries = (): ParameterDecorator => {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: number[] = Reflect.getOwnMetadata(FEIGN_QUERY_PARAMS_METADATA, target, propertyKey) || [];

    existingParams.push(parameterIndex);
    Reflect.defineMetadata(FEIGN_QUERY_PARAMS_METADATA, existingParams, target, propertyKey);
  };
};

export const Body = (): ParameterDecorator => {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: number[] = Reflect.getOwnMetadata(FEIGN_BODY_PARAMS_METADATA, target, propertyKey) || [];
    existingParams.push(parameterIndex);

    Reflect.defineMetadata(FEIGN_BODY_PARAMS_METADATA, existingParams, target, propertyKey);
  };
};

export const Headers = (): ParameterDecorator => {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: number[] = Reflect.getOwnMetadata(FEIGN_HEADER_PARAMS_METADATA, target, propertyKey) || [];
    existingParams.push(parameterIndex);

    Reflect.defineMetadata(FEIGN_HEADER_PARAMS_METADATA, existingParams, target, propertyKey);
  };
};
