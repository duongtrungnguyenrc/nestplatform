import { OnModuleInit } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { IFeatureExplorer } from "../interfaces";
export declare class AppExplorerRuleRegistry implements OnModuleInit {
    private readonly discovery;
    private readonly reflector;
    private readonly rules;
    constructor(discovery: DiscoveryService, reflector: Reflector);
    onModuleInit(): void;
    getRules(): IFeatureExplorer[];
}
