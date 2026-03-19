"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionContext = void 0;
const node_async_hooks_1 = require("node:async_hooks");
class TransactionContext {
    static run(store, fn) {
        return this.storage.run(store, fn);
    }
    static getStore() {
        return this.storage.getStore();
    }
    static getTransaction() {
        return this.storage.getStore()?.transaction;
    }
}
exports.TransactionContext = TransactionContext;
TransactionContext.storage = new node_async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=transaction-context.js.map