"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExplorer = void 0;
const common_1 = require("@nestjs/common");
const common_constant_1 = require("../common.constant");
const FeatureExplorer = () => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(common_constant_1.METADATA_EXPLORER_METADATA, true));
};
exports.FeatureExplorer = FeatureExplorer;
//# sourceMappingURL=feature-explorer.decorator.js.map