export type TransactionStore = {
    transaction: any;
    adapterKey: string;
};
export declare class TransactionContext {
    private static readonly storage;
    static run<T>(store: TransactionStore, fn: () => Promise<T>): Promise<T>;
    static getStore(): TransactionStore | undefined;
    static getTransaction<T = any>(): T | undefined;
}
