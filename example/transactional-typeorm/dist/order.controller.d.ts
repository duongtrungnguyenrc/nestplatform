import { OrderService } from './order.service';
export declare class OrderController {
  private readonly orderService;
  constructor(orderService: OrderService);
  createOrder(body: {
    productName: string;
    amount: number;
  }): Promise<import('./order.entity').Order>;
  createOrderWithEvent(body: {
    productName: string;
    amount: number;
  }): Promise<import('./order.entity').Order>;
  createOrderDeclarative(body: {
    productName: string;
    amount: number;
  }): Promise<import('./order.entity').Order>;
  testRollback(): Promise<void>;
  findAll(): Promise<import('./order.entity').Order[]>;
  findById(id: string): Promise<import('./order.entity').Order | null>;
}
