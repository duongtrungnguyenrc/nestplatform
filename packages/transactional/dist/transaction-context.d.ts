import { TransactionSynchronization } from "./interfaces";
export type TransactionStore = {
  transaction: any;
  adapterKey: string;
  synchronizations?: TransactionSynchronization[];
};
export declare class TransactionContext {
  private static readonly storage;
  static run<T>(store: TransactionStore, fn: () => Promise<T>): Promise<T>;
  static getStore(): TransactionStore | undefined;
  static getTransaction<T = any>(): T | undefined;
  static addSynchronization(synchronization: TransactionSynchronization): void;
  static invokeBeforeCommit(): Promise<void>;
  static invokeAfterCommit(): Promise<void>;
  static invokeAfterRollback(error: any): Promise<void>;
  static invokeAfterCompletion(status: "committed" | "rolled-back"): Promise<void>;
}
