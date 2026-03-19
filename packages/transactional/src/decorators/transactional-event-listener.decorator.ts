import { applyDecorators, SetMetadata } from "@nestjs/common";
import { TRANSACTIONAL_EVENT_LISTENER_METADATA } from "../transactional.constant";
import { TransactionalEventListenerOptions } from "../types";

/**
 * Decorator to mark a method as a transactional event listener.
 *
 * Listener execution will be deferred based on the specified transaction phase:
 * - AFTER_COMMIT (default): Runs after the transaction successfully commits.
 * - AFTER_ROLLBACK: Runs after the transaction rolls back.
 * - AFTER_COMPLETION: Runs after the transaction completes (either committed or rolled back).
 * - BEFORE_COMMIT: Runs before the transaction commits.
 *
 * @param event - The event name to listen for
 * @param options - Additional options (phase, fallbackExecution)
 *
 * @example
 * ```typescript
 * @TransactionalEventListener('order.created', { phase: TransactionPhase.AFTER_COMMIT })
 * async onOrderCreated(event: OrderCreatedEvent) {
 *   // Sends email only if transaction committed
 * }
 * ```
 */
export const TransactionalEventListener = (event: string, options?: TransactionalEventListenerOptions): MethodDecorator => {
  return applyDecorators(
    SetMetadata(TRANSACTIONAL_EVENT_LISTENER_METADATA, {
      event,
      ...options,
    }),
  );
};
