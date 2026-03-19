import { AsyncLocalStorage } from "node:async_hooks";
import { TransactionSynchronization } from "./interfaces";

/**
 * Transaction store containing the active transaction handle and its adapter.
 * Propagated through the async call stack via AsyncLocalStorage (Node.js CLS).
 */
export type TransactionStore = {
  /** The active transaction handle (e.g., TypeORM QueryRunner, Mongoose Session, MikroORM EntityManager) */
  transaction: any;

  /** The adapter key that owns this transaction */
  adapterKey: string;

  /** Registered synchronizations for the current transaction */
  synchronizations?: TransactionSynchronization[];
};

/**
 * AsyncLocalStorage-based transaction context propagation.
 *
 * Mirrors how Spring uses ThreadLocal to propagate transaction context.
 * In Node.js, AsyncLocalStorage achieves the same effect across the async call stack.
 */
export class TransactionContext {
  private static readonly storage = new AsyncLocalStorage<TransactionStore>();

  /**
   * Run a callback within a transaction context.
   * The store will be available to all async operations within the callback scope.
   */
  static run<T>(store: TransactionStore, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(store, fn);
  }

  /**
   * Get the current transaction store from the async context.
   * Returns `undefined` if no transaction is active in the current scope.
   */
  static getStore(): TransactionStore | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current transaction from the async context.
   * Returns `undefined` if no transaction is active in the current scope.
   */
  static getTransaction<T = any>(): T | undefined {
    return this.storage.getStore()?.transaction;
  }

  /**
   * Register a synchronization with the current transaction context.
   * If no transaction is active, the synchronization will not be registered.
   *
   * @param synchronization - The synchronization to register
   */
  static addSynchronization(synchronization: TransactionSynchronization): void {
    const store = this.getStore();
    if (store) {
      if (!store.synchronizations) {
        store.synchronizations = [];
      }
      store.synchronizations.push(synchronization);
    }
  }

  /**
   * Invoke beforeCommit hooks for all registered synchronizations.
   * Internal use only (by adapters).
   */
  static async invokeBeforeCommit(): Promise<void> {
    const store = this.getStore();
    if (store?.synchronizations) {
      for (const sync of store.synchronizations) {
        await sync.beforeCommit?.();
      }
    }
  }

  /**
   * Invoke afterCommit hooks for all registered synchronizations.
   * Internal use only (by adapters).
   */
  static async invokeAfterCommit(): Promise<void> {
    const store = this.getStore();
    if (store?.synchronizations) {
      for (const sync of store.synchronizations) {
        await sync.afterCommit?.();
      }
    }
  }

  /**
   * Invoke afterRollback hooks for all registered synchronizations.
   * Internal use only (by adapters).
   */
  static async invokeAfterRollback(error: any): Promise<void> {
    const store = this.getStore();
    if (store?.synchronizations) {
      for (const sync of store.synchronizations) {
        await sync.afterRollback?.(error);
      }
    }
  }

  /**
   * Invoke afterCompletion hooks for all registered synchronizations.
   * Internal use only (by adapters).
   */
  static async invokeAfterCompletion(status: "committed" | "rolled-back"): Promise<void> {
    const store = this.getStore();
    if (store?.synchronizations) {
      for (const sync of store.synchronizations) {
        await sync.afterCompletion?.(status);
      }
    }
  }
}
