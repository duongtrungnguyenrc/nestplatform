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
    static addSynchronization(synchronization) {
        const store = this.getStore();
        if (store) {
            if (!store.synchronizations) {
                store.synchronizations = [];
            }
            store.synchronizations.push(synchronization);
        }
    }
    static async invokeBeforeCommit() {
        const store = this.getStore();
        if (store?.synchronizations) {
            for (const sync of store.synchronizations) {
                await sync.beforeCommit?.();
            }
        }
    }
    static async invokeAfterCommit() {
        const store = this.getStore();
        if (store?.synchronizations) {
            for (const sync of store.synchronizations) {
                await sync.afterCommit?.();
            }
        }
    }
    static async invokeAfterRollback(error) {
        const store = this.getStore();
        if (store?.synchronizations) {
            for (const sync of store.synchronizations) {
                await sync.afterRollback?.(error);
            }
        }
    }
    static async invokeAfterCompletion(status) {
        const store = this.getStore();
        if (store?.synchronizations) {
            for (const sync of store.synchronizations) {
                await sync.afterCompletion?.(status);
            }
        }
    }
}
exports.TransactionContext = TransactionContext;
TransactionContext.storage = new node_async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=transaction-context.js.map