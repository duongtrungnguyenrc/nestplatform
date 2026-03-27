import { FeatureDecoration, stringifyMethod } from "@nestplatform/common";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter } from "node:events";

import { DistributedLockAbortSignal, IDistributedLockService, ResourceLockedException } from "./";

import { DEFAULT_DISTRIBUTION_PROVIDER, DISTRIBUTION_LOCK_SERVICES } from "./distribution-lock.constant";
import { DistributedLockServices, DistributionLockOptions } from "./types";

const LOGGING_CONTEXT = "DISTRIBUTION_LOCK";

/**
 * Core service that implements the distributed lock management logic for the `@DistributionLock()` decorator.
 *
 * This service is responsible for wrapping decorated methods with lock acquisition/release logic
 * based on the decorator metadata. It delegates the actual locking to the registered
 * `IDistributedLockService` implementation.
 *
 * @internal This class is used internally by the `DistributionLockMetadataExplorer`.
 */
@Injectable()
export class DistributionLockFeatureDecoration extends FeatureDecoration {
  constructor(@Inject(DISTRIBUTION_LOCK_SERVICES) private readonly lockServices: DistributedLockServices) {
    super();
  }

  /**
   * Wrap a method with distributed lock acquisition and release logic.
   *
   * Resolves the correct lock service provider and replaces the original method
   * with an async wrapper that acquires the lock before execution and releases it afterward.
   *
   * @param instance       - The class instance owning the method
   * @param methodName     - Name of the method to wrap
   * @param originalMethod - The original method reference
   * @param lockOptions    - Lock configuration from the `@DistributionLock()` decorator
   *
   * @internal
   */
  public wrapMethodWithDistributionLock(instance: any, methodName: string, originalMethod: Function, lockOptions: DistributionLockOptions): void {
    const providerKey: string = lockOptions.provider || DEFAULT_DISTRIBUTION_PROVIDER;
    const fallbackProvider: IDistributedLockService = Object.values(this.lockServices)[0]; // Default or first provider

    const lockService: IDistributedLockService = this.lockServices[providerKey] || fallbackProvider;

    if (!lockService) {
      if (lockOptions.logging) {
        Logger.warn(`Distributed lock service not found. Skip for handler ${methodName}.`, LOGGING_CONTEXT);
      }

      return;
    }

    instance[methodName] = async (...args: any[]): Promise<any> => {
      const lockKey: string = typeof lockOptions.key === "function" ? lockOptions.key(args) : lockOptions.key;
      const methodString: string = stringifyMethod(methodName, ...args);

      try {
        return await lockService.withLock(
          [lockKey],
          lockOptions.ttl,
          async (signal: DistributedLockAbortSignal): Promise<any> => {
            if (signal.aborted && lockOptions.logging) {
              Logger.warn("Lock aborted while running.");
            }

            return await originalMethod.apply(instance, args);
          },
          (emitter: EventEmitter): void => {
            if (lockOptions.logging) {
              emitter?.on("acquired", (): void => {
                Logger.log(`Task \`${methodString}\` locked by ${providerKey} lock with key \`${lockKey}\`.`, LOGGING_CONTEXT);
              });

              emitter?.on("released", (): void => {
                Logger.log(`Task \`${methodString}\` released ${providerKey} lock.`, LOGGING_CONTEXT);
              });
            }
          },
        );
      } catch (e) {
        if (e instanceof ResourceLockedException) {
          if (lockOptions.logging) {
            Logger.log(`Task \`${methodString}\` already locked by ${providerKey} lock with key \`${lockKey}\`.`, LOGGING_CONTEXT);
          }

          return;
        }

        throw e;
      }
    };
  }
}
