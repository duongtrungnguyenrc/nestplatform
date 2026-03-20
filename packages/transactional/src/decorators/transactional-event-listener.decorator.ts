import { SetMetadata } from "@nestjs/common";
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
 * @param event - The name of the event to listen for.
 * @param options - Listener options including the transaction phase.
 */
export function TransactionalEventListener(event: string, options?: TransactionalEventListenerOptions): MethodDecorator {
  return SetMetadata(TRANSACTIONAL_EVENT_LISTENER_METADATA, { ...options, event });
}
