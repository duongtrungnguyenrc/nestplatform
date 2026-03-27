import { DynamicModule, Module } from "@nestjs/common";

import { ConfigurableModule, FeatureExplorerModule } from "@nestplatform/common";

import { DistributedLockAsyncProvider, DistributedLockProvider } from "./providers";
import { DistributionModuleConfigSync, DistributionModuleConfigAsync } from "./types";
import { DistributionLockMetadataExplorer } from "./distribution-lock-metadata.explorer";
import { DistributionLockFeatureDecoration } from "./distribution-lock-feature.decoration";
import { DistributionLockMetadataAccessor } from "./distribution-lock-metadata.accessor";

/**
 * Module that provides declarative distributed lock management.
 *
 * This module explores methods decorated with `@DistributionLock()`
 * and wraps them with lock acquisition/release logic provided by
 * specific lock service implementations (e.g. Redis Redlock, PostgreSQL Advisory Locks).
 *
 * @example
 * ```typescript
 * // Synchronous registration
 * DistributionLockModule.register({
 *   providers: new PgLockService(pool),
 * })
 *
 * // Async registration
 * DistributionLockModule.registerAsync({
 *   inject: [PgLockService],
 *   useFactory: (pgLockService: PgLockService) => ({
 *     providers: pgLockService,
 *   }),
 * })
 * ```
 */
@Module({})
export class DistributionLockModule extends ConfigurableModule {
  static register(config: DistributionModuleConfigSync): DynamicModule {
    return super.config(config, {
      global: true,
      module: DistributionLockModule,
      imports: [FeatureExplorerModule],
      providers: [
        DistributedLockProvider(config),
        DistributionLockMetadataAccessor,
        DistributionLockFeatureDecoration,
        DistributionLockMetadataExplorer,
      ],
    });
  }

  static registerAsync(config: DistributionModuleConfigAsync): DynamicModule {
    return super.config(config, {
      global: true,
      module: DistributionLockModule,
      imports: [FeatureExplorerModule],
      providers: [
        DistributedLockAsyncProvider(config),
        DistributionLockMetadataAccessor,
        DistributionLockFeatureDecoration,
        DistributionLockMetadataExplorer,
      ],
    });
  }
}
