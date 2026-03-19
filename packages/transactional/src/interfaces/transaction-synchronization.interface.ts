/**
 * Hook interface for transaction lifecycle events.
 *
 * Synchronizations are registered with the active transaction context
 * and triggered by the adapter during commit or rollback.
 */
export interface TransactionSynchronization {
  /**
   * Invoked before the transaction commits.
   * Can be used to perform actions before the physical commit happens.
   */
  beforeCommit?(): void | Promise<void>;

  /**
   * Invoked after the transaction has successfully committed.
   * Can be used to perform post-commit actions like sending notifications or cache eviction.
   */
  afterCommit?(): void | Promise<void>;

  /**
   * Invoked after the transaction has rolled back.
   *
   * @param error - The error that caused the rollback
   */
  afterRollback?(error: any): void | Promise<void>;

  /**
   * Invoked after the transaction has completed (either committed or rolled back).
   *
   * @param status - 'committed' or 'rolled-back'
   */
  afterCompletion?(status: "committed" | "rolled-back"): void | Promise<void>;
}
