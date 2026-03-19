import { DynamicModule } from "@nestjs/common";
import { ConfigurableModule } from "@nestplatform/common";
import { TransactionalModuleConfigAsync, TransactionalModuleConfigSync } from "./types";
export declare class TransactionalModule extends ConfigurableModule {
    static register(config: TransactionalModuleConfigSync): DynamicModule;
    static registerAsync(config: TransactionalModuleConfigAsync): DynamicModule;
}
