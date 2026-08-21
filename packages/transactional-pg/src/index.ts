import {
  TransactionContext,
  TransactionStore,
  TransactionExecuteOptions,
  TransactionPropagation,
  ITransactionAdapter,
  TransactionProxyResource,
  RollbackOnError,
  RollbackOnErrorPredicate,
} from "@nestplatform/transactional";
import { Pool, PoolClient } from "pg";

/**
 * PostgreSQL `pg` transaction adapter.
 *
 * Uses PoolClient for transaction management:
 * - REQUIRED: Reuse existing PoolClient from context, or create a new one
 * - REQUIRES_NEW: Always create a new PoolClient, suspend current context
 * - NESTED: Create a savepoint on the existing PoolClient
 *
 * @example
 * ```typescript
 * import { Pool } from "pg";
 *
 * TransactionalModule.registerAsync({
 *     inject: [Pool],
 *     useFactory: (pool: Pool) => ({
 *         adapters: new PgTransactionAdapter(pool),
 *     }),
 * })
 * ```
 */
export class PgTransactionAdapter implements ITransactionAdapter {
  constructor(private readonly pool: Pool) {}

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

  getActiveTransaction(): PoolClient | undefined {
    const store: TransactionStore | undefined = TransactionContext.getStore();

    return store?.transaction as PoolClient | undefined;
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
    const existingClient = existingStore?.transaction as PoolClient | undefined;

    if (!existingClient) {
      return this.runInNewTransaction(callback, options);
    }

    const savepointName = this.createSavepointName();

    await existingClient.query(`SAVEPOINT "${savepointName}"`);

    try {
      const result: T = await callback();
      await existingClient.query(`RELEASE SAVEPOINT "${savepointName}"`);

      return result;
    } catch (error) {
      if (this.shouldRollback(error, options.rollbackOnError)) {
        await existingClient.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);
      } else {
        await existingClient.query(`RELEASE SAVEPOINT "${savepointName}"`);
      }

      throw error;
    }
  }

  proxyResource(value: any): TransactionProxyResource | undefined {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    const isPool = typeof value.connect === "function" && typeof value.query === "function";
    const isClient = typeof value.query === "function" && typeof value.release === "function";

    if (!isPool && !isClient) {
      return undefined;
    }

    const client = TransactionContext.getTransaction<PoolClient>();
    if (!client) {
      return { value };
    }

    if (isClient) {
      return { value: this.createClientProxy(client) };
    }

    return { value: this.createPoolProxy(value as Pool, client) };
  }

  /**
   * Execute callback in a new PG client transaction.
   */
  private async runInNewTransaction<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const client: PoolClient = await this.pool.connect();

    if (options.isolation) {
      await client.query(`BEGIN ISOLATION LEVEL ${options.isolation}`);
    } else {
      await client.query("BEGIN");
    }

    const store: TransactionStore = {
      transaction: client,
      adapterKey: "pg",
    };

    try {
      const result: T = await TransactionContext.run(store, callback);

      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeBeforeCommit();
      });

      await client.query("COMMIT");

      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeAfterCommit();
        await TransactionContext.invokeAfterCompletion("committed");
      });

      return result;
    } catch (error) {
      if (this.shouldRollback(error, options.rollbackOnError)) {
        await client.query("ROLLBACK");

        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterRollback(error);
          await TransactionContext.invokeAfterCompletion("rolled-back");
        });
      } else {
        await client.query("COMMIT");

        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterCommit();
          await TransactionContext.invokeAfterCompletion("committed");
        });
      }

      throw error;
    } finally {
      client.release();
    }
  }

  private createPoolProxy(pool: Pool, client: PoolClient): Pool {
    const clientProxy = this.createClientProxy(client);

    return new Proxy(pool, {
      get(poolTarget, poolProp, poolReceiver) {
        if (poolProp === "query") {
          return client.query.bind(client);
        }

        if (poolProp === "connect") {
          return async () => clientProxy;
        }

        const poolValue = Reflect.get(poolTarget, poolProp, poolReceiver);

        if (typeof poolValue === "function") {
          return function (...args: any[]) {
            return poolValue.apply(poolTarget, args);
          };
        }

        return poolValue;
      },
    });
  }

  private createClientProxy(client: PoolClient): PoolClient {
    return new Proxy(client, {
      get(clientTarget, clientProp, clientReceiver) {
        if (clientProp === "release") {
          return () => undefined;
        }

        const clientValue = Reflect.get(clientTarget, clientProp, clientReceiver);

        if (typeof clientValue === "function") {
          return function (...args: any[]) {
            return clientValue.apply(clientTarget, args);
          };
        }

        return clientValue;
      },
    });
  }

  private createSavepointName(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
        if (error.name === errOption || error.constructor?.name === errOption) {
          return true;
        }
      } else if (typeof errOption === "function") {
        if (error instanceof (errOption as any)) {
          return true;
        }

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
