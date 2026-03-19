import { TransactionExecuteOptions, ITransactionAdapter } from "@nestplatform/transactional";
import { DataSource, QueryRunner } from "typeorm";
export declare class TypeOrmTransactionAdapter implements ITransactionAdapter {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T>;
    getActiveTransaction(): QueryRunner | undefined;
    private executeRequired;
    private executeRequiresNew;
    private executeNested;
    proxyInstance<T extends object>(instance: T): T;
    private runInNewTransaction;
}
