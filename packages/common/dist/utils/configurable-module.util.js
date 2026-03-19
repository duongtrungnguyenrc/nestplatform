"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurableModule = void 0;
const common_helpers_1 = require("../common.helpers");
class ConfigurableModule {
    static config(config, moduleConfig) {
        return (0, common_helpers_1.deepMerge)({
            global: config.global,
            imports: [...(config.extraModules ? config.extraModules : [])],
            providers: [...(config.extraProviders ? config.extraProviders : [])],
            exports: [...(config.extraExports ? config.extraExports : [])],
        }, moduleConfig);
    }
}
exports.ConfigurableModule = ConfigurableModule;
//# sourceMappingURL=configurable-module.util.js.map