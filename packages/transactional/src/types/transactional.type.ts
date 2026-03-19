import { ITransactionAdapter } from "../interfaces";

export enum TransactionPropagation {
  /** Join existing transaction or create a new one (default) */
  REQUIRED = "REQUIRED",

  /** Always create a new transaction, suspending the current one */
  REQUIRES_NEW = "REQUIRES_NEW",

  /** Create a savepoint within the existing transaction */
  NESTED = "NESTED",
}

export enum TransactionIsolation {
  READ_UNCOMMITTED = "READ UNCOMMITTED",
  READ_COMMITTED = "READ COMMITTED",
  REPEATABLE_READ = "REPEATABLE READ",
  SERIALIZABLE = "SERIALIZABLE",
}

/**
 * Predicate to determine if an error should trigger a rollback.
 */
export type RollbackOnErrorPredicate = (error: any) => boolean;

/**
 * Options for rollback behavior.
 * - `boolean`: If `true`, always rollback on error. If `false`, never rollback.
 * - `string`: Rollback only if the error name matches this string.
 * - `Type<Error>` (Function): Rollback only if the error is an instance of this class.
 * - `Array<string | Type<Error>>`: Rollback if the error matches any of the specified names or classes.
 * - `RollbackOnErrorPredicate`: Custom logic to determine if the error should trigger a rollback.
 */
export type RollbackOnError =
  | boolean
  | string
  | (new (...args: any[]) => any)
  | Array<string | (new (...args: any[]) => any)>
  | RollbackOnErrorPredicate;

export enum TransactionPhase {
  /** Execute the listener before transaction commit */
  BEFORE_COMMIT = "BEFORE_COMMIT",

  /** Execute the listener after transaction successfully committed (default) */
  AFTER_COMMIT = "AFTER_COMMIT",

  /** Execute the listener after transaction rolled back */
  AFTER_ROLLBACK = "AFTER_ROLLBACK",

  /** Execute the listener after transaction completion (either committed or rolled back) */
  AFTER_COMPLETION = "AFTER_COMPLETION",
}

export type TransactionalEventListenerOptions = {
  /** The phase in which the listener should be triggered */
  phase?: TransactionPhase;

  /**
   * Whether to fallback to immediate execution if no transaction is active.
   * Defaults to `true`.
   */
  fallbackExecution?: boolean;
};

export type TransactionalEventOptions = {
  /**
   * Function to extract the event payload from the method's return value.
   * If not provided, the entire return value is used as the payload.
   */
  payload?: (result: any) => any;
};

export type TransactionalOptions = {
  propagation?: TransactionPropagation;
  isolation?: TransactionIsolation;
  adapter?: string;
  logging?: boolean;
  /**
   * Defines which errors should trigger a rollback.
   * Defaults to `true` (rollback on all errors).
   */
  rollbackOnError?: RollbackOnError;
};

export type TransactionExecuteOptions = {
  propagation: TransactionPropagation;
  isolation?: TransactionIsolation;
  /**
   * Defines which errors should trigger a rollback.
   */
  rollbackOnError?: RollbackOnError;
};

export type TransactionAdapters = Record<string, ITransactionAdapter>;
