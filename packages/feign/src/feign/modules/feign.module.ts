import { Global, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { FeignMetadataAccessor } from "../feign-metadata.accessor";
import { FeignMetadataExplorer } from "../feign-metadata.explorer";
import { FeignFeatureDecoration } from "../feign-feature.decoration";
import { FeignFetcherRegistry } from "../feign-fetcher.registry";

import { FeatureExplorerModule } from "@nestplatform/common";

@Global()
@Module({
  imports: [DiscoveryModule, FeatureExplorerModule],
  providers: [FeignMetadataAccessor, FeignMetadataExplorer, FeignFetcherRegistry, FeignFeatureDecoration],
  exports: [FeignFetcherRegistry],
})
export class FeignModule {}
