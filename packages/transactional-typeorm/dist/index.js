"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmTransactionAdapter = void 0;
const transactional_1 = require("@nestplatform/transactional");
class TypeOrmTransactionAdapter {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async execute(callback, options) {
        switch (options.propagation) {
            case transactional_1.TransactionPropagation.REQUIRED:
                return this.executeRequired(callback, options);
            case transactional_1.TransactionPropagation.REQUIRES_NEW:
                return this.executeRequiresNew(callback, options);
            case transactional_1.TransactionPropagation.NESTED:
                return this.executeNested(callback, options);
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
        return this.runInNewTransaction(callback, options);
    }
    async executeRequiresNew(callback, options) {
        return this.runInNewTransaction(callback, options);
    }
    async executeNested(callback, options) {
        const existingStore = transactional_1.TransactionContext.getStore();
        const existingQueryRunner = existingStore?.transaction;
        if (!existingQueryRunner || existingQueryRunner.isReleased) {
            return this.runInNewTransaction(callback, options);
        }
        const savepointName = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await existingQueryRunner.query(`SAVEPOINT "${savepointName}"`);
        try {
            const result = await callback();
            await existingQueryRunner.query(`RELEASE SAVEPOINT "${savepointName}"`);
            return result;
        }
        catch (error) {
            if (this.shouldRollback(error, options.rollbackOnError)) {
                await existingQueryRunner.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);
            }
            else {
                await existingQueryRunner.query(`RELEASE SAVEPOINT "${savepointName}"`);
            }
            throw error;
        }
    }
    proxyInstance(instance) {
        return new Proxy(instance, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === "function") {
                    return function (...args) {
                        return value.apply(receiver, args);
                    };
                }
                const isRepo = value && typeof value === "object" && value.metadata && value.manager;
                if (isRepo) {
                    const queryRunner = transactional_1.TransactionContext.getTransaction();
                    if (!queryRunner || queryRunner.isReleased) {
                        return value;
                    }
                    const txManager = queryRunner.manager;
                    const txRepo = txManager.getRepository(value.metadata.target);
                    return new Proxy(txRepo, {
                        get(repoTarget, repoProp, repoReceiver) {
                            const repoValue = Reflect.get(repoTarget, repoProp, repoReceiver);
                            if (typeof repoValue === "function") {
                                return function (...args) {
                                    return repoValue.apply(repoTarget, args);
                                };
                            }
                            return repoValue;
                        },
                    });
                }
                return value;
            },
        });
    }
    async runInNewTransaction(callback, options) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        if (options.isolation) {
            await queryRunner.startTransaction(options.isolation);
        }
        else {
            await queryRunner.startTransaction();
        }
        const store = {
            transaction: queryRunner,
            adapterKey: "typeorm",
        };
        try {
            const result = await transactional_1.TransactionContext.run(store, callback);
            await transactional_1.TransactionContext.run(store, async () => {
                await transactional_1.TransactionContext.invokeBeforeCommit();
            });
            await queryRunner.commitTransaction();
            await transactional_1.TransactionContext.run(store, async () => {
                await transactional_1.TransactionContext.invokeAfterCommit();
                await transactional_1.TransactionContext.invokeAfterCompletion("committed");
            });
            return result;
        }
        catch (error) {
            if (this.shouldRollback(error, options.rollbackOnError)) {
                await queryRunner.rollbackTransaction();
                await transactional_1.TransactionContext.run(store, async () => {
                    await transactional_1.TransactionContext.invokeAfterRollback(error);
                    await transactional_1.TransactionContext.invokeAfterCompletion("rolled-back");
                });
            }
            else {
                await queryRunner.commitTransaction();
                await transactional_1.TransactionContext.run(store, async () => {
                    await transactional_1.TransactionContext.invokeAfterCommit();
                    await transactional_1.TransactionContext.invokeAfterCompletion("committed");
                });
            }
            throw error;
        }
        finally {
            await queryRunner.release();
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
                if (error.name === errOption || error.constructor.name === errOption) {
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
exports.TypeOrmTransactionAdapter = TypeOrmTransactionAdapter;
//# sourceMappingURL=index.js.map