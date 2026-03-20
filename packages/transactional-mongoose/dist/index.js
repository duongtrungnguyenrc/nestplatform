"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseTransactionAdapter = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("@nestjs/common");
const transactional_1 = require("@nestplatform/transactional");
const LOGGING_CONTEXT = "MongooseTransactionAdapter";
class MongooseTransactionAdapter {
    constructor(connection) {
        this.connection = connection;
    }
    async execute(callback, options) {
        if (options.isolation) {
            common_1.Logger.warn("Isolation levels are not supported by MongoDB. The isolation option will be ignored.", LOGGING_CONTEXT);
        }
        switch (options.propagation) {
            case transactional_1.TransactionPropagation.REQUIRED:
                return this.executeRequired(callback, options);
            case transactional_1.TransactionPropagation.REQUIRES_NEW:
                return this.executeRequiresNew(callback, options);
            case transactional_1.TransactionPropagation.NESTED:
                common_1.Logger.warn("NESTED propagation is not supported by MongoDB. Falling back to REQUIRED.", LOGGING_CONTEXT);
                return this.executeRequired(callback, options);
            default:
                return this.executeRequired(callback, options);
        }
    }
    getActiveTransaction() {
        const store = transactional_1.TransactionContext.getStore();
        return store?.transaction;
    }
    async executeRequired(callback, options) {
        const existingStore = transactional_1.TransactionContext.getStore();
        if (existingStore?.transaction) {
            return callback();
        }
        return this.runInNewSession(callback, options);
    }
    async executeRequiresNew(callback, options) {
        return this.runInNewSession(callback, options);
    }
    proxyInstance(instance) {
        return new Proxy(instance, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);
                if (!value) {
                    return value;
                }
                const isModel = typeof value === "function" && value.prototype && (value.prototype instanceof mongoose_1.Model || value.prototype.$session);
                if (isModel) {
                    const session = transactional_1.TransactionContext.getTransaction();
                    if (!session) {
                        return value;
                    }
                    return new Proxy(value, {
                        construct(modelTarget, argArray, newTarget) {
                            const document = Reflect.construct(modelTarget, argArray, newTarget);
                            if (typeof document.$session === "function") {
                                document.$session(session);
                            }
                            return document;
                        },
                        get(modelTarget, modelProp, modelReceiver) {
                            const modelValue = Reflect.get(modelTarget, modelProp, modelReceiver);
                            if (typeof modelValue === "function") {
                                return function (...args) {
                                    const result = modelValue.apply(modelTarget, args);
                                    if (result && typeof result.session === "function") {
                                        return result.session(session);
                                    }
                                    return result;
                                };
                            }
                            return modelValue;
                        },
                    });
                }
                if (typeof value === "function") {
                    return function (...args) {
                        return value.apply(receiver, args);
                    };
                }
                return value;
            },
        });
    }
    async runInNewSession(callback, options) {
        const session = await this.connection.startSession();
        session.startTransaction();
        const store = {
            transaction: session,
            adapterKey: "mongoose",
        };
        try {
            const result = await transactional_1.TransactionContext.run(store, callback);
            await transactional_1.TransactionContext.run(store, async () => {
                await transactional_1.TransactionContext.invokeBeforeCommit();
            });
            await session.commitTransaction();
            await transactional_1.TransactionContext.run(store, async () => {
                await transactional_1.TransactionContext.invokeAfterCommit();
                await transactional_1.TransactionContext.invokeAfterCompletion("committed");
            });
            return result;
        }
        catch (error) {
            if (this.shouldRollback(error, options.rollbackOnError)) {
                await session.abortTransaction();
                await transactional_1.TransactionContext.run(store, async () => {
                    await transactional_1.TransactionContext.invokeAfterRollback(error);
                    await transactional_1.TransactionContext.invokeAfterCompletion("rolled-back");
                });
            }
            else {
                await session.commitTransaction();
                await transactional_1.TransactionContext.run(store, async () => {
                    await transactional_1.TransactionContext.invokeAfterCommit();
                    await transactional_1.TransactionContext.invokeAfterCompletion("committed");
                });
            }
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    shouldRollback(error, rollbackOnError) {
        if (rollbackOnError === undefined || rollbackOnError === true) {
            return true;
        }
        if (rollbackOnError === false) {
            return false;
        }
        const errors = Array.isArray(rollbackOnError) ? rollbackOnError : [rollbackOnError];
        for (const errOption of errors) {
            if (typeof errOption === "string") {
                if (error.name === errOption || error.constructor?.name === errOption) {
                    return true;
                }
            }
            else if (typeof errOption === "function") {
                if (error instanceof errOption) {
                    return true;
                }
                try {
                    if (errOption(error) === true) {
                        return true;
                    }
                }
                catch {
                }
            }
        }
        return false;
    }
}
exports.MongooseTransactionAdapter = MongooseTransactionAdapter;
//# sourceMappingURL=index.js.map