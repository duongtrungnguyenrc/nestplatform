import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { OnModuleInit } from "@nestjs/common";
import { AppExplorerRuleRegistry } from "./feature-explorer.registry";
export declare class FeatureExplorerEngine implements OnModuleInit {
    private readonly discovery;
    private readonly metadataScanner;
    private readonly registry;
    private static initialized;
    constructor(discovery: DiscoveryService, metadataScanner: MetadataScanner, registry: AppExplorerRuleRegistry);
    onModuleInit(): void;
}
