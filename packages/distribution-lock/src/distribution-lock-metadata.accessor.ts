import { MetadataAccessor } from "@nestplatform/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { DISTRIBUTION_LOCK_METADATA } from "./distribution-lock.constant";
import { DistributionLockOptions } from "./types";

/**
 * Reads `@DistributionLock()` metadata from method reflectors.
 *
 * @internal This class is used internally by the `DistributionLockMetadataExplorer`.
 */
@Injectable()
export class DistributionLockMetadataAccessor extends MetadataAccessor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  /**
   * Retrieve the `@DistributionLock()` options attached to a method, if any.
   *
   * @param target - The method reference to inspect
   * @returns The lock options, or `undefined` if the method is not decorated
   *
   * @internal
   */
  public getDistributedMetadata(target: Function): DistributionLockOptions | undefined {
    return this.getMetadata<DistributionLockOptions>(DISTRIBUTION_LOCK_METADATA, target);
  }
}
