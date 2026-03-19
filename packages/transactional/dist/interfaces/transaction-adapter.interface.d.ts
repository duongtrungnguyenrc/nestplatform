import { TransactionExecuteOptions } from "../types";
export interface ITransactionAdapter {
    proxyInstance?<T extends object>(instance: T): T;
    execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T>;
    getActiveTransaction(): any | undefined;
}
