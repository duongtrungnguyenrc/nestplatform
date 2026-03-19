import { Injectable, Logger } from "@nestjs/common";
import { TransactionContext } from "./transaction-context";
import { TransactionPhase } from "./types";

export type TransactionalListenerMetadata = {
  event: string;
  phase?: TransactionPhase;
  fallbackExecution?: boolean;
  callback: (payload: any) => Promise<void> | void;
};

/**
 * Service to publish events that are aware of the active transaction.
 *
 * If a transaction is active, the event listener execution is deferred
 * to the specified transaction phase (default: AFTER_COMMIT).
 */
@Injectable()
export class TransactionalEventPublisher {
  private readonly listeners = new Map<string, TransactionalListenerMetadata[]>();
  private readonly logger = new Logger(TransactionalEventPublisher.name);

  /**
   * Register a listener for a specific event.
   * Internal use only (by TransactionalMetadataExplorer).
   */
  registerListener(metadata: TransactionalListenerMetadata): void {
    const eventListeners = this.listeners.get(metadata.event) || [];
    eventListeners.push(metadata);
    this.listeners.set(metadata.event, eventListeners);
  }

  /**
   * Publish an event.
   *
   * @param event - The event name
   * @param payload - The event payload
   */
  async publish(event: string, payload: any): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    const store = TransactionContext.getStore();

    for (const listener of eventListeners) {
      if (!store) {
        // No active transaction - execute according to fallback policy
        if (listener.fallbackExecution !== false) {
          await this.executeListener(listener, payload);
        }
        continue;
      }

      // Inside a transaction - defer execution based on phase
      const phase = listener.phase || TransactionPhase.AFTER_COMMIT;
      const self = this;

      TransactionContext.addSynchronization({
        async beforeCommit() {
          if (phase === TransactionPhase.BEFORE_COMMIT) {
            await self.executeListener(listener, payload);
          }
        },
        async afterCommit() {
          if (phase === TransactionPhase.AFTER_COMMIT) {
            await self.executeListener(listener, payload);
          }
        },
        async afterRollback() {
          if (phase === TransactionPhase.AFTER_ROLLBACK) {
            await self.executeListener(listener, payload);
          }
        },
        async afterCompletion() {
          if (phase === TransactionPhase.AFTER_COMPLETION) {
            await self.executeListener(listener, payload);
          }
        },
      });
    }
  }

  private async executeListener(listener: TransactionalListenerMetadata, payload: any): Promise<void> {
    try {
      await listener.callback(payload);
    } catch (error) {
      this.logger.error(`Error in transactional event listener for event "${listener.event}": ${error}`);
    }
  }
}
