import { applyDecorators, SetMetadata } from "@nestjs/common";

import { DISTRIBUTION_LOCK_METADATA } from "../distribution-lock.constant";
import { DistributionLockOptions } from "../types";

/**
 * Method decorator that wraps the target method with distributed lock logic.
 *
 * When the decorated method is invoked, the framework will automatically
 * acquire a distributed lock using the configured provider, execute the method,
 * and release the lock when the method completes or throws.
 *
 * If the lock cannot be acquired (resource is already locked), the method
 * call is silently skipped.
 *
 * @param options - Lock configuration including key, TTL, and optional provider
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PaymentService {
 *   @DistributionLock({ key: 'payment:process', ttl: 5000, logging: true })
 *   async processPayment(orderId: string) {
 *     // Only one instance can process at a time
 *   }
 *
 *   @DistributionLock({
 *     key: (args) => `payment:${args[0]}`,
 *     ttl: 10000,
 *   })
 *   async refund(orderId: string) {
 *     // Lock key is derived from method arguments
 *   }
 * }
 * ```
 */
export const DistributionLock = (options: DistributionLockOptions): MethodDecorator => {
  return applyDecorators(SetMetadata(DISTRIBUTION_LOCK_METADATA, options));
};
