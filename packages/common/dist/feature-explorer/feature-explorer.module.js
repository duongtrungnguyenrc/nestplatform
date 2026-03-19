"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExplorerModule = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const feature_explorer_registry_1 = require("./feature-explorer.registry");
const feature_explorer_engine_1 = require("./feature-explorer.engine");
let FeatureExplorerModule = class FeatureExplorerModule {
};
exports.FeatureExplorerModule = FeatureExplorerModule;
exports.FeatureExplorerModule = FeatureExplorerModule = __decorate([
    (0, common_1.Module)({
        imports: [core_1.DiscoveryModule],
        providers: [feature_explorer_registry_1.AppExplorerRuleRegistry, feature_explorer_engine_1.FeatureExplorerEngine],
    })
], FeatureExplorerModule);
//# sourceMappingURL=feature-explorer.module.js.map