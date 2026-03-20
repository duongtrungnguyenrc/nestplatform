import { applyDecorators, SetMetadata } from "@nestjs/common";

import { FEIGN_METHOD_METADATA } from "../feign.constant";

export const Get = (path: string): MethodDecorator => {
  return applyDecorators(SetMetadata(FEIGN_METHOD_METADATA, { path, method: "GET" }));
};

export const Post = (path: string): MethodDecorator => {
  return applyDecorators(SetMetadata(FEIGN_METHOD_METADATA, { path, method: "POST" }));
};

export const Put = (path: string): MethodDecorator => {
  return applyDecorators(SetMetadata(FEIGN_METHOD_METADATA, { path, method: "PUT" }));
};

export const Patch = (path: string): MethodDecorator => {
  return applyDecorators(SetMetadata(FEIGN_METHOD_METADATA, { path, method: "PATCH" }));
};

export const Delete = (path: string): MethodDecorator => {
  return applyDecorators(SetMetadata(FEIGN_METHOD_METADATA, { path, method: "DELETE" }));
};
