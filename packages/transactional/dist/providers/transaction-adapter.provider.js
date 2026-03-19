"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAdapterProvider = void 0;
const transactional_constant_1 = require("../transactional.constant");
const TransactionAdapterProvider = (config) => {
    return {
        provide: transactional_constant_1.TRANSACTION_ADAPTERS,
        useFactory: async () => {
            const adapters = config.adapters;
            return !!adapters["execute"] ? { [transactional_constant_1.DEFAULT_TRANSACTION_ADAPTER]: adapters } : adapters;
        },
    };
};
exports.TransactionAdapterProvider = TransactionAdapterProvider;
//# sourceMappingURL=transaction-adapter.provider.js.map