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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppExplorerRuleRegistry = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const common_constant_1 = require("../common.constant");
let AppExplorerRuleRegistry = class AppExplorerRuleRegistry {
    constructor(discovery, reflector) {
        this.discovery = discovery;
        this.reflector = reflector;
        this.rules = [];
    }
    onModuleInit() {
        for (const wrapper of this.discovery.getProviders()) {
            const { instance, metatype } = wrapper;
            if (!instance || !metatype)
                continue;
            if (this.reflector.get(common_constant_1.METADATA_EXPLORER_METADATA, metatype)) {
                this.rules.push(instance);
            }
        }
    }
    getRules() {
        return this.rules;
    }
};
exports.AppExplorerRuleRegistry = AppExplorerRuleRegistry;
exports.AppExplorerRuleRegistry = AppExplorerRuleRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.DiscoveryService,
        core_1.Reflector])
], AppExplorerRuleRegistry);
//# sourceMappingURL=feature-explorer.registry.js.map