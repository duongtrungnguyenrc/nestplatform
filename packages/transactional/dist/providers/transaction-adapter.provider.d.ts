import { FactoryProvider } from "@nestjs/common";
import { TransactionalModuleConfigSync } from "../types";
export declare const TransactionAdapterProvider: (config: TransactionalModuleConfigSync) => FactoryProvider;
