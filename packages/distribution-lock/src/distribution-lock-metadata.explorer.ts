import { IFeatureExplorer, FeatureExplorer, MethodContext } from "@nestplatform/common";
import { Injectable } from "@nestjs/common";

import { DistributionLockFeatureDecoration } from "./distribution-lock-feature.decoration";
import { DistributionLockMetadataAccessor } from "./distribution-lock-metadata.accessor";
import { DistributionLockOptions } from "./types";

/**
 * Metadata explorer that discovers methods decorated with `@DistributionLock()`
 * and delegates wrapping to the `DistributionLockFeatureDecoration` service.
 *
 * @internal This class is used internally by the module bootstrap process.
 */
@Injectable()
@FeatureExplorer()
export class DistributionLockMetadataExplorer implements IFeatureExplorer {
  constructor(
    private readonly metadataAccessor: DistributionLockMetadataAccessor,
    private readonly featureDecoration: DistributionLockFeatureDecoration,
  ) {}

  /**
   * Called for each method discovered during module initialization.
   * If the method has `@DistributionLock()` metadata, it wraps the method with lock logic.
   *
   * @param ctx - The method context containing instance, method name, and method reference
   *
   * @internal
   */
  onMethod(ctx: MethodContext) {
    const { instance, methodName, methodRef } = ctx;

    const lockOptions: DistributionLockOptions | undefined = this.metadataAccessor.getDistributedMetadata(methodRef);

    if (!lockOptions) return;

    this.featureDecoration.wrapMethodWithDistributionLock(instance, methodName, methodRef, lockOptions);
  }
}
