import { Repository } from 'typeorm';
import { TransactionalEventPublisher } from '@nestplatform/transactional';
import { Order } from './order.entity';
export declare class BusinessException extends Error {
  constructor(message: string);
}
export declare class OrderService {
  private readonly orderRepo;
  private readonly eventPublisher;
  private readonly logger;
  constructor(
    orderRepo: Repository<Order>,
    eventPublisher: TransactionalEventPublisher,
  );
  createOrderWithEvent(productName: string, amount: number): Promise<Order>;
  createOrderDeclarative(productName: string, amount: number): Promise<Order>;
  onOrderCreated(order: Order): Promise<void>;
  onOrderFailed(order: Order): Promise<void>;
  processWithConditionalRollback(): Promise<void>;
  createOrder(productName: string, amount: number): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  createAuditLog(orderId: string, action: string): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  adjustOrderAmount(orderId: string, adjustment: number): Promise<void>;
}
