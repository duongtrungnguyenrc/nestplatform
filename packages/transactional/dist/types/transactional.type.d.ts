import { ITransactionAdapter } from "../interfaces";
export declare enum TransactionPropagation {
  REQUIRED = "REQUIRED",
  REQUIRES_NEW = "REQUIRES_NEW",
  NESTED = "NESTED",
}
export declare enum TransactionIsolation {
  READ_UNCOMMITTED = "READ UNCOMMITTED",
  READ_COMMITTED = "READ COMMITTED",
  REPEATABLE_READ = "REPEATABLE READ",
  SERIALIZABLE = "SERIALIZABLE",
}
export type RollbackOnErrorPredicate = (error: any) => boolean;
export type RollbackOnError =
  | boolean
  | string
  | (new (...args: any[]) => any)
  | Array<string | (new (...args: any[]) => any)>
  | RollbackOnErrorPredicate;
export declare enum TransactionPhase {
  BEFORE_COMMIT = "BEFORE_COMMIT",
  AFTER_COMMIT = "AFTER_COMMIT",
  AFTER_ROLLBACK = "AFTER_ROLLBACK",
  AFTER_COMPLETION = "AFTER_COMPLETION",
}
export type TransactionalEventListenerOptions = {
  phase?: TransactionPhase;
  fallbackExecution?: boolean;
};
export type TransactionalEventOptions = {
  payload?: (result: any) => any;
};
export type TransactionalOptions = {
  propagation?: TransactionPropagation;
  isolation?: TransactionIsolation;
  adapter?: string;
  logging?: boolean;
  rollbackOnError?: RollbackOnError;
};
export type TransactionExecuteOptions = {
  propagation: TransactionPropagation;
  isolation?: TransactionIsolation;
  rollbackOnError?: RollbackOnError;
};
export type TransactionAdapters = Record<string, ITransactionAdapter>;
