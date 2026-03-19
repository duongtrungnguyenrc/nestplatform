import { DiscoveryModule } from "@nestjs/core";
import { Module } from "@nestjs/common";

import { AppExplorerRuleRegistry } from "./feature-explorer.registry";
import { FeatureExplorerEngine } from "./feature-explorer.engine";

@Module({
  imports: [DiscoveryModule],
  providers: [AppExplorerRuleRegistry, FeatureExplorerEngine],
})
export class FeatureExplorerModule {}
