import { DynamicModule } from "@nestjs/common";
import { ModuleConfigBase } from "../common.type";
export declare abstract class ConfigurableModule {
    protected static config(config: ModuleConfigBase, moduleConfig: DynamicModule): DynamicModule;
}
