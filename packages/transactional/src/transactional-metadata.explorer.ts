import { Injectable } from "@nestjs/common";

import { IFeatureExplorer, FeatureExplorer, MethodContext, ProviderContext } from "@nestplatform/common";

import { TransactionalFeatureDecoration } from "./transactional-feature.decoration";
import { TransactionalMetadataAccessor } from "./transactional-metadata.accessor";
import { TransactionalOptions } from "./types";

@Injectable()
@FeatureExplorer()
export class TransactionalMetadataExplorer implements IFeatureExplorer {
  /**
   * Stores class-level @Transactional() options, keyed by class constructor.
   * Used to apply class-level defaults to all methods of the class.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  private readonly classLevelOptions = new Map<Function, TransactionalOptions>();

  constructor(
    private readonly metadataAccessor: TransactionalMetadataAccessor,
    private readonly featureDecoration: TransactionalFeatureDecoration,
  ) {}

  /**
   * Scan each provider for class-level @Transactional() metadata.
   */
  onProvider(ctx: ProviderContext): void {
    const { metatype } = ctx;

    const classOptions: TransactionalOptions | undefined = this.metadataAccessor.getTransactionalMetadata(metatype);

    if (classOptions) {
      this.classLevelOptions.set(metatype, classOptions);
    }
  }

  /**
   * Scan each method for @Transactional()/@NoTransactional() metadata.
   * Class-level options serve as defaults; method-level options override them.
   */
  onMethod(ctx: MethodContext): void {
    const { instance, methodName, methodRef, metatype } = ctx;

    // Check if method is explicitly excluded
    const isExcluded: boolean | undefined = this.metadataAccessor.getNoTransactionalMetadata(methodRef);

    if (isExcluded) return;

    // Method-level options take highest priority
    const methodOptions: TransactionalOptions | undefined = this.metadataAccessor.getTransactionalMetadata(methodRef);

    // Class-level options as fallback
    const classOptions: TransactionalOptions | undefined = this.classLevelOptions.get(metatype);

    // Merge: method-level overrides class-level
    const resolvedOptions: TransactionalOptions | undefined = methodOptions ? { ...classOptions, ...methodOptions } : classOptions;

    if (!resolvedOptions) return;

    this.featureDecoration.wrapMethodWithTransaction(instance, methodName, methodRef, resolvedOptions);
  }
}
