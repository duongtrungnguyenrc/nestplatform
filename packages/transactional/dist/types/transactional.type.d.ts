import { ITransactionAdapter } from "../interfaces";
export declare enum TransactionPropagation {
    REQUIRED = "REQUIRED",
    REQUIRES_NEW = "REQUIRES_NEW",
    NESTED = "NESTED"
}
export declare enum TransactionIsolation {
    READ_UNCOMMITTED = "READ UNCOMMITTED",
    READ_COMMITTED = "READ COMMITTED",
    REPEATABLE_READ = "REPEATABLE READ",
    SERIALIZABLE = "SERIALIZABLE"
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
