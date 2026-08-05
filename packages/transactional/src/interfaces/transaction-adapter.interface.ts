import { TransactionExecuteOptions } from "../types";

export type TransactionProxyContext = {
  adapterKey: string;
};

export type TransactionProxyResource = {
  value: any;
};

/**
 * Plugin interface for ORM transaction adapters.
 *
 * Each adapter is responsible for managing the lifecycle of transactions
 * for its specific ORM (TypeORM, Mongoose, MikroORM, etc.).
 *
 * The adapter handles:
 * 1. Creating/reusing transactions based on propagation behavior
 * 2. Committing on success, rolling back on error
 * 3. Managing savepoints for NESTED propagation
 * 4. Context propagation (storing/retrieving the active transaction)
 * 5. Resolving ORM-specific resources to transaction-bound resources
 */
export interface ITransactionAdapter {
  /**
   * Resolve an ORM-specific resource to its transaction-bound equivalent.
   *
   * The transactional core owns recursive proxy traversal, method binding, and
   * proxy caching. Adapters only implement resource-specific behavior here
   * (for example replacing a TypeORM Repository with a QueryRunner repository).
   *
   * Return `undefined` when the value is not handled by this adapter.
   * Return `{ value }` to either replace the resource or mark it as handled.
   */
  proxyResource(value: any, context: TransactionProxyContext): TransactionProxyResource | undefined;

  /**
   * Execute callback within a transaction.
   *
   * @param callback - The function to execute within the transaction scope
   * @param options  - Transaction execution options (propagation, isolation)
   * @returns The result of the callback
   */
  execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T>;

  /**
   * Get the active transaction handle from the current context.
   * Returns `undefined` if no transaction is active.
   *
   * This is useful for repositories or services that need to access
   * the current transaction directly (e.g., TypeORM QueryRunner, Mongoose Session).
   */
  getActiveTransaction(): any | undefined;
}
