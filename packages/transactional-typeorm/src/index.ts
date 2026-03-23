import {
  TransactionContext,
  TransactionStore,
  TransactionExecuteOptions,
  TransactionPropagation,
  ITransactionAdapter,
  RollbackOnError,
  RollbackOnErrorPredicate,
} from "@nestplatform/transactional";
import { DataSource, QueryRunner } from "typeorm";

/**
 * TypeORM transaction adapter.
 *
 * Uses QueryRunner for transaction management:
 * - REQUIRED: Reuse existing QueryRunner from context, or create new one
 * - REQUIRES_NEW: Always create a new QueryRunner, suspend current context
 * - NESTED: Create a savepoint on the existing QueryRunner
 *
 * @example
 * ```typescript
 * import { DataSource } from "typeorm";
 *
 * TransactionalModule.registerAsync({
 *     inject: [DataSource],
 *     useFactory: (dataSource: DataSource) => ({
 *         adapters: new TypeOrmTransactionAdapter(dataSource),
 *     }),
 * })
 * ```
 */
export class TypeOrmTransactionAdapter implements ITransactionAdapter {
  private readonly proxyCache = new WeakMap<object, any>();

  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    switch (options.propagation) {
      case TransactionPropagation.REQUIRED:
        return this.executeRequired(callback, options);

      case TransactionPropagation.REQUIRES_NEW:
        return this.executeRequiresNew(callback, options);

      case TransactionPropagation.NESTED:
        return this.executeNested(callback, options);

      default:
        return this.executeRequired(callback, options);
    }
  }

  getActiveTransaction(): QueryRunner | undefined {
    const store: TransactionStore | undefined = TransactionContext.getStore();

    return store?.transaction as QueryRunner | undefined;
  }

  /**
   * REQUIRED: Join existing transaction or create a new one.
   */
  private async executeRequired<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const existingStore: TransactionStore | undefined = TransactionContext.getStore();

    if (existingStore?.transaction) {
      return callback();
    }

    return this.runInNewTransaction(callback, options);
  }

  /**
   * REQUIRES_NEW: Always create a new transaction, suspending the current one.
   */
  private async executeRequiresNew<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    return this.runInNewTransaction(callback, options);
  }

  /**
   * NESTED: Create a savepoint within the existing transaction.
   * Falls back to REQUIRED if no existing transaction.
   */
  private async executeNested<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const existingStore: TransactionStore | undefined = TransactionContext.getStore();
    const existingQueryRunner = existingStore?.transaction as QueryRunner | undefined;

    if (!existingQueryRunner || existingQueryRunner.isReleased) {
      return this.runInNewTransaction(callback, options);
    }

    const savepointName = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await existingQueryRunner.query(`SAVEPOINT "${savepointName}"`);

    try {
      const result: T = await callback();
      await existingQueryRunner.query(`RELEASE SAVEPOINT "${savepointName}"`);

      return result;
    } catch (error) {
      if (this.shouldRollback(error, options.rollbackOnError)) {
        await existingQueryRunner.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);
      } else {
        await existingQueryRunner.query(`RELEASE SAVEPOINT "${savepointName}"`);
      }

      throw error;
    }
  }

  /**
   * Proxy to override injected typeorm repository instances to replace by transaction-aware repositories.
   */
  proxyInstance<T extends object>(instance: T): T {
    return new Proxy(instance, {
      get: (target, prop, receiver) => {
        const value: any = Reflect.get(target, prop, receiver);

        console.log("proxy instance:", instance);

        // Make sure this context always proxied
        if (typeof value === "function") {
          return function (...args: any[]) {
            return value.apply(receiver, args);
          };
        }

        if (value && typeof value === "object") {
          // Skip built-in objects to avoid issues
          if (
            value instanceof Promise ||
            value instanceof Date ||
            Array.isArray(value) ||
            value instanceof RegExp ||
            value instanceof Map ||
            value instanceof Set ||
            value instanceof WeakMap ||
            value instanceof WeakSet
          ) {
            return value;
          }

          /**
           * Check if the value is a TypeORM repository by checking for the presence of metadata and manager properties.
           */
          const isRepo = value.metadata && value.manager;

          if (isRepo) {
            // Get the transaction context
            const queryRunner = TransactionContext.getTransaction<QueryRunner>();

            if (!queryRunner || queryRunner.isReleased) {
              return value;
            }

            const txManager = queryRunner.manager;
            const txRepo = txManager.getRepository(value.metadata.target);

            return new Proxy(txRepo, {
              get(repoTarget, repoProp, repoReceiver) {
                const repoValue = Reflect.get(repoTarget, repoProp, repoReceiver);

                if (typeof repoValue === "function") {
                  return function (...args: any[]) {
                    return repoValue.apply(repoTarget, args);
                  };
                }

                return repoValue;
              },
            });
          }

          // Not a repo, maybe it's a nested service or object we want to proxy
          // We must be careful not to proxy TypeORM's internal Connection/DataSource or QueryRunner
          if (typeof value.query === "function" && typeof value.isReleased === "boolean") {
            return value;
          }
          if (typeof value.createQueryRunner === "function") {
            return value;
          }

          // Use WeakMap to store created proxies
          if (this.proxyCache.has(value)) {
            return this.proxyCache.get(value);
          }

          const proxied = this.proxyInstance(value);
          this.proxyCache.set(value, proxied);
          return proxied;
        }

        return value;
      },
    });
  }

  /**
   * Execute callback in a new QueryRunner transaction.
   */
  private async runInNewTransaction<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    if (options.isolation) {
      await queryRunner.startTransaction(options.isolation);
    } else {
      await queryRunner.startTransaction();
    }

    const store: TransactionStore = {
      transaction: queryRunner,
      adapterKey: "typeorm",
    };

    try {
      const result: T = await TransactionContext.run(store, callback);

      // Invoke beforeCommit
      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeBeforeCommit();
      });

      await queryRunner.commitTransaction();

      // Invoke synchronizations
      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeAfterCommit();
        await TransactionContext.invokeAfterCompletion("committed");
      });

      return result;
    } catch (error) {
      if (this.shouldRollback(error, options.rollbackOnError)) {
        await queryRunner.rollbackTransaction();

        // Invoke synchronizations
        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterRollback(error);
          await TransactionContext.invokeAfterCompletion("rolled-back");
        });
      } else {
        await queryRunner.commitTransaction();

        // Invoke synchronizations
        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterCommit();
          await TransactionContext.invokeAfterCompletion("committed");
        });
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Determine if the error should trigger a rollback based on options.
   */
  private shouldRollback(error: any, rollbackOnError?: RollbackOnError): boolean {
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
      } else if (typeof errOption === "function") {
        // Check if it's a class constructor
        if (error instanceof (errOption as any)) {
          return true;
        }
        // Try as predicate
        try {
          if ((errOption as RollbackOnErrorPredicate)(error) === true) {
            return true;
          }
        } catch {
          // ignore
        }
      }
    }

    return false;
  }
}
