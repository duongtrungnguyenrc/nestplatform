"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoTransactional = exports.Transactional = void 0;
const common_1 = require("@nestjs/common");
const transactional_constant_1 = require("../transactional.constant");
const types_1 = require("../types");
const TRANSACTIONAL_DEFAULTS = {
    propagation: types_1.TransactionPropagation.REQUIRED,
    logging: false,
    rollbackOnError: true,
};
const Transactional = (options) => {
    const mergedOptions = {
        ...TRANSACTIONAL_DEFAULTS,
        ...options,
    };
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(transactional_constant_1.TRANSACTIONAL_METADATA, mergedOptions));
};
exports.Transactional = Transactional;
const NoTransactional = () => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(transactional_constant_1.NO_TRANSACTIONAL_METADATA, true));
};
exports.NoTransactional = NoTransactional;
//# sourceMappingURL=transactional.decorator.js.map