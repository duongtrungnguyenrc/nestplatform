import { Repository } from 'typeorm';
import { Order } from './order.entity';
export declare class OrderService {
    private readonly orderRepo;
    private readonly logger;
    constructor(orderRepo: Repository<Order>);
    createOrder(productName: string, amount: number): Promise<Order>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    createAuditLog(orderId: string, action: string): Promise<void>;
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
    adjustOrderAmount(orderId: string, adjustment: number): Promise<void>;
}
