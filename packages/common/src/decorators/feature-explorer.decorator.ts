import { applyDecorators, SetMetadata } from "@nestjs/common";

import { METADATA_EXPLORER_METADATA } from "../common.constant";

export const FeatureExplorer = (): ClassDecorator => {
  return applyDecorators(SetMetadata(METADATA_EXPLORER_METADATA, true));
};
