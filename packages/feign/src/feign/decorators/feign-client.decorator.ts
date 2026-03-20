import { applyDecorators, SetMetadata } from "@nestjs/common";

import { FEIGN_CLIENT_METADATA } from "../feign.constant";
import { FeignClientOptions } from "../types";

export const FeignClient = (options: FeignClientOptions): ClassDecorator => {
  return applyDecorators(SetMetadata(FEIGN_CLIENT_METADATA, options));
};
