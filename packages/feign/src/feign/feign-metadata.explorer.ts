import { Injectable, Type } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core";

import { IFeatureExplorer, FeatureExplorer, ProviderContext } from "@nestplatform/common";
import { FeignFeatureDecoration } from "./feign-feature.decoration";
import { FeignMetadataAccessor } from "./feign-metadata.accessor";
import { FeignClientOptions, FeignMethodOptions } from "./types";

@Injectable()
@FeatureExplorer()
export class FeignMetadataExplorer implements IFeatureExplorer {
  constructor(
    private readonly metadataAccessor: FeignMetadataAccessor,
    private readonly featureDecoration: FeignFeatureDecoration,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  public onProvider(ctx: ProviderContext) {
    const { instance, wrapper } = ctx;

    const clientOptions: FeignClientOptions | undefined = this.metadataAccessor.getFeignClientMetadata(wrapper.metatype as Type);

    if (!clientOptions) return;

    const proto = Object.getPrototypeOf(instance);
    const methods: string[] = this.metadataScanner.getAllMethodNames(proto);

    for (const methodName of methods) {
      const methodRef = instance[methodName];
      if (typeof methodRef !== "function") continue;

      const feignMethodOptions: FeignMethodOptions | undefined = this.metadataAccessor.getFeignMethodMetadata(methodRef);

      if (!feignMethodOptions) continue;

      this.featureDecoration.decorateFetch(instance, methodRef, clientOptions, feignMethodOptions);
    }
  }
}
