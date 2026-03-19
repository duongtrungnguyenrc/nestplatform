import { DynamicModule, Module } from "@nestjs/common";

import { FeatureExplorerModule, ConfigurableModule } from "@nestplatform/common";

import { TransactionAdapterAsyncProvider, TransactionAdapterProvider } from "./providers";
import { TransactionalModuleConfigAsync, TransactionalModuleConfigSync } from "./types";
import { TransactionalMetadataExplorer } from "./transactional-metadata.explorer";
import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";

@Module({})
export class TransactionalModule extends ConfigurableModule {
  static register(config: TransactionalModuleConfigSync): DynamicModule {
    return super.config(config, {
      global: true,
      module: TransactionalModule,
      imports: [FeatureExplorerModule],
      providers: [TransactionAdapterProvider(config), TransactionalMetadataExplorer, TransactionalMetadataAccessor, TransactionalFeatureDecoration],
    });
  }

  static registerAsync(config: TransactionalModuleConfigAsync): DynamicModule {
    return super.config(config, {
      global: true,
      module: TransactionalModule,
      imports: [FeatureExplorerModule],
      providers: [
        TransactionAdapterAsyncProvider(config),
        TransactionalMetadataExplorer,
        TransactionalMetadataAccessor,
        TransactionalFeatureDecoration,
      ],
    });
  }
}
