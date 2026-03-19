import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { Injectable, OnModuleInit } from "@nestjs/common";

import { IFeatureExplorer, MethodContext, ProviderContext } from "../interfaces";
import { AppExplorerRuleRegistry } from "./feature-explorer.registry";

@Injectable()
export class FeatureExplorerEngine implements OnModuleInit {
  private static initialized: boolean = false;

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly registry: AppExplorerRuleRegistry,
  ) {}

  onModuleInit() {
    if (FeatureExplorerEngine.initialized) return;
    FeatureExplorerEngine.initialized = true;

    const wrappers: InstanceWrapper[] = this.discovery.getProviders();
    const rules: Readonly<IFeatureExplorer[]> = Object.freeze(this.registry.getRules());

    for (const wrapper of wrappers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      const providerCtx: ProviderContext = { instance, metatype, wrapper };
      rules.forEach((r: IFeatureExplorer) => r.onProvider?.(providerCtx));

      const proto = Object.getPrototypeOf(instance);
      const methods: string[] = this.metadataScanner.getAllMethodNames(proto);

      for (const methodName of methods) {
        const methodRef = instance[methodName];
        if (typeof methodRef !== "function") continue;

        const methodCtx: MethodContext = {
          ...providerCtx,
          methodName,
          methodRef,
        };

        rules.forEach((r: IFeatureExplorer) => r.onMethod?.(methodCtx));
      }
    }

    rules.forEach((r: IFeatureExplorer) => r.onFinish?.());
  }
}
