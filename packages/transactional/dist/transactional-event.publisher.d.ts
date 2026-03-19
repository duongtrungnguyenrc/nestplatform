import { TransactionPhase } from "./types";
export type TransactionalListenerMetadata = {
  event: string;
  phase?: TransactionPhase;
  fallbackExecution?: boolean;
  callback: (payload: any) => Promise<void> | void;
};
export declare class TransactionalEventPublisher {
  private readonly listeners;
  private readonly logger;
  registerListener(metadata: TransactionalListenerMetadata): void;
  publish(event: string, payload: any): Promise<void>;
  private executeListener;
}
