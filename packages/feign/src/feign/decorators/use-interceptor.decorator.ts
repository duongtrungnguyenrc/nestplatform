import { FEIGN_REQUEST_INTERCEPTORS_METADATA, FEIGN_RESPONSE_INTERCEPTORS_METADATA } from "../feign.constant";
import { FetchRequestInterceptor } from "../../fetch";

export const UseRequestInterceptors = (...interceptors: FetchRequestInterceptor[]): ClassDecorator & MethodDecorator => {
  return (target: object, propertyKey?: string | symbol) => {
    if (propertyKey) {
      // Method decorator
      const existingInterceptors: FetchRequestInterceptor[] = Reflect.getOwnMetadata(FEIGN_REQUEST_INTERCEPTORS_METADATA, target, propertyKey) || [];
      Reflect.defineMetadata(FEIGN_REQUEST_INTERCEPTORS_METADATA, [...existingInterceptors, ...interceptors], target, propertyKey);
    } else {
      // Class decorator
      const existingInterceptors: FetchRequestInterceptor[] = Reflect.getOwnMetadata(FEIGN_RESPONSE_INTERCEPTORS_METADATA, target) || [];
      Reflect.defineMetadata(FEIGN_RESPONSE_INTERCEPTORS_METADATA, [...existingInterceptors, ...interceptors], target);
    }
  };
};
