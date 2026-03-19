import { applyDecorators, SetMetadata } from "@nestjs/common";
import { TRANSACTIONAL_EVENT_METADATA } from "../transactional.constant";
import { TransactionalEventOptions } from "../types";

/**
 * Decorator to mark a method to automatically publish a transactional event
 * upon successful execution (no error thrown).
 *
 * If a transaction is active, the event will be deferred to the specified phase
 * (via TransactionalEventPublisher).
 *
 * @param event - The event name to publish
 * @param options - Additional options (payload extractor)
 *
 * @example
 * ```typescript
 * @Transactional()
 * @TransactionalEvent('order.created')
 * async createOrder(data: any) {
 *   return this.orderRepo.save(data); // The saved order is the event payload
 * }
 * ```
 */
export const TransactionalEvent = (event: string, options?: TransactionalEventOptions): MethodDecorator => {
  return applyDecorators(
    SetMetadata(TRANSACTIONAL_EVENT_METADATA, {
      event,
      ...options,
    }),
  );
};
