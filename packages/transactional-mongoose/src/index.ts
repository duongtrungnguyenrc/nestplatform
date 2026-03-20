import { ClientSession, Connection, Model } from "mongoose";
import { Logger } from "@nestjs/common";

import {
  TransactionContext,
  TransactionStore,
  ITransactionAdapter,
  TransactionExecuteOptions,
  TransactionPropagation,
  RollbackOnError,
  RollbackOnErrorPredicate,
} from "@nestplatform/transactional";

const LOGGING_CONTEXT = "MongooseTransactionAdapter";

/**
 * Mongoose transaction adapter.
 *
 * Uses ClientSession for transaction management:
 * - REQUIRED: Reuse existing session or start new one
 * - REQUIRES_NEW: Always create a new session
 * - NESTED: Not natively supported by MongoDB, falls back to REQUIRED behavior
 *
 * Note: MongoDB transactions require a replica set or sharded cluster.
 * Isolation levels are not supported by Mongoose/MongoDB (MongoDB uses snapshot isolation).
 *
 * @example
 * ```typescript
 * import { getConnectionToken } from "@nestjs/mongoose";
 *
 * TransactionalModule.registerAsync({
 *     inject: [getConnectionToken()],
 *     useFactory: (connection: Connection) => ({
 *         adapters: new MongooseTransactionAdapter(connection),
 *     }),
 * })
 * ```
 */
export class MongooseTransactionAdapter implements ITransactionAdapter {
  /**
   * @internal
   */
  constructor(private readonly connection: Connection) {}

  async execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    if (options.isolation) {
      Logger.warn("Isolation levels are not supported by MongoDB. The isolation option will be ignored.", LOGGING_CONTEXT);
    }

    switch (options.propagation) {
      case TransactionPropagation.REQUIRED:
        return this.executeRequired(callback, options);

      case TransactionPropagation.REQUIRES_NEW:
        return this.executeRequiresNew(callback, options);

      case TransactionPropagation.NESTED:
        Logger.warn("NESTED propagation is not supported by MongoDB. Falling back to REQUIRED.", LOGGING_CONTEXT);
        return this.executeRequired(callback, options);

      default:
        return this.executeRequired(callback, options);
    }
  }

  getActiveTransaction(): ClientSession | undefined {
    const store: TransactionStore | undefined = TransactionContext.getStore();

    return store?.transaction as ClientSession | undefined;
  }

  /**
   * REQUIRED: Join existing session or create a new one.
   */
  private async executeRequired<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const existingStore: TransactionStore | undefined = TransactionContext.getStore();

    if (existingStore?.transaction) {
      return callback();
    }

    return this.runInNewSession(callback, options);
  }

  /**
   * REQUIRES_NEW: Always create a new session.
   */
  private async executeRequiresNew<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    return this.runInNewSession(callback, options);
  }

  /**
   * Proxy to override injected mongoose model instances to attach transaction session automatically.
   */
  proxyInstance<T extends object>(instance: T): T {
    return new Proxy(instance, {
      get: (target, prop, receiver) => {
        const value: any = Reflect.get(target, prop, receiver);

        if (!value) {
          return value;
        }

        const isModel = typeof value === "function" && value.prototype && (value.prototype instanceof Model || value.prototype.$session);

        if (isModel) {
          const session = TransactionContext.getTransaction<ClientSession>();

          if (!session) {
            return value;
          }

          return new Proxy(value, {
            /**
             * Handle model constructor: new Model(data)
             */
            construct(modelTarget, argArray, newTarget) {
              const document = Reflect.construct(modelTarget, argArray, newTarget);
              if (typeof document.$session === "function") {
                document.$session(session);
              }
              return document;
            },

            /**
             * Handle static methods: Model.find(), Model.create(), etc.
             */
            get(modelTarget, modelProp, modelReceiver) {
              const modelValue = Reflect.get(modelTarget, modelProp, modelReceiver);

              if (typeof modelValue === "function") {
                return function (...args: any[]) {
                  const result = modelValue.apply(modelTarget, args);

                  /**
                   * Auto bind session for query-like objects or other return values
                   */
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

        // Ensure method binding is preserved for regular methods
        if (typeof value === "function") {
          return function (...args: any[]) {
            return value.apply(receiver, args);
          };
        }

        return value;
      },
    });
  }

  /**
   * Execute callback in a new Mongoose session with transaction.
   */
  private async runInNewSession<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T> {
    const session: ClientSession = await this.connection.startSession();

    session.startTransaction();

    const store: TransactionStore = {
      transaction: session,
      adapterKey: "mongoose",
    };

    try {
      const result: T = await TransactionContext.run(store, callback);

      // Invoke beforeCommit
      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeBeforeCommit();
      });

      await session.commitTransaction();

      // Invoke synchronizations
      await TransactionContext.run(store, async () => {
        await TransactionContext.invokeAfterCommit();
        await TransactionContext.invokeAfterCompletion("committed");
      });

      return result;
    } catch (error) {
      if (this.shouldRollback(error, options.rollbackOnError)) {
        await session.abortTransaction();

        // Invoke synchronizations
        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterRollback(error);
          await TransactionContext.invokeAfterCompletion("rolled-back");
        });
      } else {
        await session.commitTransaction();

        // Invoke synchronizations
        await TransactionContext.run(store, async () => {
          await TransactionContext.invokeAfterCommit();
          await TransactionContext.invokeAfterCompletion("committed");
        });
      }

      throw error;
    } finally {
      await session.endSession();
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
