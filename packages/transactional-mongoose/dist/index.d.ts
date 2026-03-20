import { ClientSession, Connection } from "mongoose";
import { ITransactionAdapter, TransactionExecuteOptions } from "@nestplatform/transactional";
export declare class MongooseTransactionAdapter implements ITransactionAdapter {
  private readonly connection;
  constructor(connection: Connection);
  execute<T>(callback: () => Promise<T>, options: TransactionExecuteOptions): Promise<T>;
  getActiveTransaction(): ClientSession | undefined;
  private executeRequired;
  private executeRequiresNew;
  proxyInstance<T extends object>(instance: T): T;
  private runInNewSession;
  private shouldRollback;
}
