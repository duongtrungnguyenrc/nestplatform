"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAdapterAsyncProvider = void 0;
const transactional_constant_1 = require("../transactional.constant");
const TransactionAdapterAsyncProvider = (config) => {
    return {
        provide: transactional_constant_1.TRANSACTION_ADAPTERS,
        inject: config.inject,
        useFactory: async (...args) => {
            const { adapters } = await config.useFactory(...args);
            return !!adapters["execute"] ? { [transactional_constant_1.DEFAULT_TRANSACTION_ADAPTER]: adapters } : adapters;
        },
    };
};
exports.TransactionAdapterAsyncProvider = TransactionAdapterAsyncProvider;
//# sourceMappingURL=transaction-adapter-async.provider.js.map