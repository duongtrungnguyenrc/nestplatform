import { FeatureDecoration } from "@nestplatform/common";
import { TransactionalOptions, TransactionAdapters } from "./types";
export declare class TransactionalFeatureDecoration extends FeatureDecoration {
    private readonly adapters;
    constructor(adapters: TransactionAdapters);
    wrapMethodWithTransaction(instance: any, methodName: string, originalMethod: Function, options: TransactionalOptions): void;
}
