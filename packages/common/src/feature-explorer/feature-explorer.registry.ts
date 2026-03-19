import { Injectable, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";

import { METADATA_EXPLORER_METADATA } from "../common.constant";
import { IFeatureExplorer } from "../interfaces";

@Injectable()
export class AppExplorerRuleRegistry implements OnModuleInit {
  private readonly rules: IFeatureExplorer[] = [];

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    for (const wrapper of this.discovery.getProviders()) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      if (this.reflector.get(METADATA_EXPLORER_METADATA, metatype)) {
        this.rules.push(instance as IFeatureExplorer);
      }
    }
  }

  public getRules(): IFeatureExplorer[] {
    return this.rules;
  }
}
