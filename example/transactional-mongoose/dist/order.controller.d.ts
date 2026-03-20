import { OrderService } from "./order.service";
import { Order } from "./order.schema";
export declare class OrderController {
  private readonly orderService;
  constructor(orderService: OrderService);
  createOrder(productName: string, amount: number): Promise<Order>;
  createOrderRequiresNew(productName: string, amount: number): Promise<Order>;
  createOrderWithRollback(productName: string, amount: number): Promise<Order>;
  createOrderWithConditionalRollback(productName: string, amount: number, shouldTypeMatch: boolean): Promise<Order>;
  createOrderDeclarative(productName: string, amount: number): Promise<Order>;
  createAuditLog(orderId: string, action: string): Promise<void>;
  adjustOrderAmount(orderId: string, adjustment: number): Promise<void>;
}
