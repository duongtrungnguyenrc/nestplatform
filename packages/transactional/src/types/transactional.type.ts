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

export type TransactionalOptions = {
  propagation?: TransactionPropagation;
  isolation?: TransactionIsolation;
  adapter?: string;
  logging?: boolean;
};

export type TransactionExecuteOptions = {
  propagation: TransactionPropagation;
  isolation?: TransactionIsolation;
};

export type TransactionAdapters = Record<string, ITransactionAdapter>;
