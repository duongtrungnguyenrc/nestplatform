import { TransactionExecuteOptions } from "../types";

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
 */
export interface ITransactionAdapter {
  /**
   * Proxy an instance to inject transaction management logic.
   *
   * @param instance - The instance to proxy
   * @returns The proxied instance
   */
  proxyInstance?<T extends object>(instance: T): T;

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
