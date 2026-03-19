import {
  TransactionContext,
  TransactionStore,
  TransactionExecuteOptions,
  TransactionPropagation,
  ITransactionAdapter,
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
      await existingQueryRunner.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);

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

        // Make sure this context always proxied
        if (typeof value === "function") {
          return function (...args: any[]) {
            return value.apply(receiver, args);
          };
        }

        /**
         * Check if the value is a TypeORM repository by checking for the presence of metadata and manager properties.
         */
        const isRepo = value && typeof value === "object" && value.metadata && value.manager;

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

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
