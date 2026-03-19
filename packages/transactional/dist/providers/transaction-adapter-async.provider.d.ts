import { FactoryProvider } from "@nestjs/common";
import { TransactionalModuleConfigAsync } from "../types";
export declare const TransactionAdapterAsyncProvider: (config: TransactionalModuleConfigAsync) => FactoryProvider;
