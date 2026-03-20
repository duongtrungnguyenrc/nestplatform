import { Model } from "mongoose";
import { Order } from "./order.schema";
import { TransactionalEventPublisher } from "@nestplatform/transactional";
export declare class OrderService {
  private readonly orderModel;
  private readonly eventPublisher;
  private readonly logger;
  constructor(orderModel: Model<Order>, eventPublisher: TransactionalEventPublisher);
  createOrder(productName: string, amount: number): Promise<Order>;
  createOrderWithEvent(productName: string, amount: number): Promise<Order>;
  createOrderRequiresNew(productName: string, amount: number): Promise<Order>;
  createOrderWithRollback(productName: string, amount: number): Promise<Order>;
  createOrderWithConditionalRollback(productName: string, amount: number, shouldTypeMatch: boolean): Promise<Order>;
  createOrderDeclarative(productName: string, amount: number): Promise<Order>;
  createAuditLog(orderId: string, action: string): Promise<void>;
  adjustOrderAmount(orderId: string, adjustment: number): Promise<void>;
  onOrderCreated(order: Order): Promise<void>;
  onOrderFailed(order: Order): Promise<void>;
}
