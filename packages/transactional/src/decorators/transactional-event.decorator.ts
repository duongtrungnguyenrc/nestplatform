import { SetMetadata } from "@nestjs/common";
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
 * Decorator that marks a method to publish an event upon successful completion.
 *
 * If the method is running within a transaction, the event publication is
 * deferred until the transaction is successfully committed.
 *
 * @param event - The name of the event to publish.
 * @param options - Optional event configuration, including a payload builder.
 */
export function TransactionalEvent(event: string, options?: TransactionalEventOptions): MethodDecorator {
  return SetMetadata(TRANSACTIONAL_EVENT_METADATA, { ...options, event });
}
