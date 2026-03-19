export interface TransactionSynchronization {
  beforeCommit?(): void | Promise<void>;
  afterCommit?(): void | Promise<void>;
  afterRollback?(error: any): void | Promise<void>;
  afterCompletion?(status: "committed" | "rolled-back"): void | Promise<void>;
}
