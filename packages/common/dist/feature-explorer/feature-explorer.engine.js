"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FeatureExplorerEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExplorerEngine = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const feature_explorer_registry_1 = require("./feature-explorer.registry");
let FeatureExplorerEngine = FeatureExplorerEngine_1 = class FeatureExplorerEngine {
    constructor(discovery, metadataScanner, registry) {
        this.discovery = discovery;
        this.metadataScanner = metadataScanner;
        this.registry = registry;
    }
    onModuleInit() {
        if (FeatureExplorerEngine_1.initialized)
            return;
        FeatureExplorerEngine_1.initialized = true;
        const wrappers = this.discovery.getProviders();
        const rules = Object.freeze(this.registry.getRules());
        for (const wrapper of wrappers) {
            const { instance, metatype } = wrapper;
            if (!instance || !metatype)
                continue;
            const providerCtx = { instance, metatype, wrapper };
            rules.forEach((r) => r.onProvider?.(providerCtx));
            const proto = Object.getPrototypeOf(instance);
            const methods = this.metadataScanner.getAllMethodNames(proto);
            for (const methodName of methods) {
                const methodRef = instance[methodName];
                if (typeof methodRef !== "function")
                    continue;
                const methodCtx = {
                    ...providerCtx,
                    methodName,
                    methodRef,
                };
                rules.forEach((r) => r.onMethod?.(methodCtx));
            }
        }
        rules.forEach((r) => r.onFinish?.());
    }
};
exports.FeatureExplorerEngine = FeatureExplorerEngine;
FeatureExplorerEngine.initialized = false;
exports.FeatureExplorerEngine = FeatureExplorerEngine = FeatureExplorerEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.DiscoveryService,
        core_1.MetadataScanner,
        feature_explorer_registry_1.AppExplorerRuleRegistry])
], FeatureExplorerEngine);
//# sourceMappingURL=feature-explorer.engine.js.map