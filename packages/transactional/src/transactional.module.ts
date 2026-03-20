import { DynamicModule, Module } from "@nestjs/common";

import { FeatureExplorerModule, ConfigurableModule } from "@nestplatform/common";

import { TransactionAdapterAsyncProvider, TransactionAdapterProvider } from "./providers";
import { TransactionalModuleConfigAsync, TransactionalModuleConfigSync } from "./types";
import { TransactionalMetadataExplorer } from "./transactional-metadata.explorer";
import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";
import { TransactionalEventPublisher } from "./transactional-event.publisher";

/**
 * Module that provides declarative transaction management.
 *
 * This module explores classes and methods decorated with `@Transactional`
 * and wraps them with transaction logic provided by specific adapters
 * (e.g. TypeORM, Mongoose).
 *
 * @example
 * ```typescript
 * TransactionalModule.register({
 *   adapters: {
 *     default: new TypeOrmTransactionAdapter(dataSource),
 *   },
 * })
 * ```
 */
@Module({})
export class TransactionalModule extends ConfigurableModule {
  static register(config: TransactionalModuleConfigSync): DynamicModule {
    return super.config(config, {
      global: true,
      module: TransactionalModule,
      imports: [FeatureExplorerModule],
      providers: [
        TransactionAdapterProvider(config),
        TransactionalMetadataExplorer,
        TransactionalMetadataAccessor,
        TransactionalFeatureDecoration,
        TransactionalEventPublisher,
      ],
      exports: [TransactionalEventPublisher],
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
        TransactionalEventPublisher,
      ],
      exports: [TransactionalEventPublisher],
    });
  }
}
