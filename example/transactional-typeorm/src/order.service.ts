import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Transactional,
  NoTransactional,
  TransactionPropagation,
  TransactionalEventPublisher,
  TransactionalEventListener,
  TransactionalEvent,
  TransactionPhase,
} from '@nestplatform/transactional';

import { Order } from './order.entity';

// Test rollback exception
export class BusinessException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessException';
  }
}

/**
 * Example service demonstrating @Transactional with TypeORM.
 */
@Transactional()
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly eventPublisher: TransactionalEventPublisher,
  ) {}

  /**
   * Create an order and publish an event.
   * The event listener will only trigger if the transaction commits.
   */
  async createOrderWithEvent(
    productName: string,
    amount: number,
  ): Promise<Order> {
    this.logger.log(`Creating order (with event) for ${productName}`);

    const order = this.orderRepo.create({
      productName,
      amount,
      status: 'pending',
    });

    const savedOrder = await this.orderRepo.save(order);

    // Publish a transactional event
    await this.eventPublisher.publish('order.created', savedOrder);

    return savedOrder;
  }

  /**
   * Create an order and publish an event declaratively using @TransactionalEvent.
   */
  @TransactionalEvent('order.created')
  async createOrderDeclarative(
    productName: string,
    amount: number,
  ): Promise<Order> {
    this.logger.log(`Creating order (declarative event) for ${productName}`);

    const order = this.orderRepo.create({
      productName,
      amount,
      status: 'pending',
    });

    return this.orderRepo.save(order);
  }

  /**
   * Transactional Event Listener - runs AFTER_COMMIT by default.
   */
  @TransactionalEventListener('order.created', {
    phase: TransactionPhase.AFTER_COMMIT,
  })
  async onOrderCreated(order: Order) {
    this.logger.log(
      `[EVENT] Order ${order.id} committed! Sending confirmation email...`,
    );
  }

  /**
   * Transactional Event Listener - runs AFTER_ROLLBACK.
   */
  @TransactionalEventListener('order.created', {
    phase: TransactionPhase.AFTER_ROLLBACK,
  })
  async onOrderFailed(order: Order) {
    this.logger.warn(`[EVENT] Order ${order.id} failed! Notifying support...`);
  }

  /**
   * Conditional rollback example using error name (string).
   * Transaction will ONLY rollback for 'BusinessException'.
   */
  @Transactional({ rollbackOnError: 'BusinessException' })
  async processWithConditionalRollback(): Promise<void> {
    await this.orderRepo.save({
      productName: 'Temp',
      amount: 10,
      status: 'processing',
    });

    throw new BusinessException('Test Error');
  }

  /**
   * Create an order - runs in a transaction (class-level default).
   */
  async createOrder(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order for ${productName}`);

    const order = this.orderRepo.create({
      productName,
      amount,
      status: 'pending',
    });

    const savedOrder = await this.orderRepo.save(order);

    // Simulate additional transactional work
    await this.updateOrderStatus(savedOrder.id, 'confirmed');

    return savedOrder;
  }

  /**
   * Update order status - also runs in the SAME transaction (REQUIRED propagation).
   *
   * Since this is called from createOrder(), it joins the existing transaction.
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    this.logger.log(`Updating order ${orderId} status to ${status}`);

    await this.orderRepo.update(orderId, { status });
  }

  /**
   * Create audit log - runs in its OWN transaction (REQUIRES_NEW).
   *
   * Even if the parent transaction rolls back, the audit log is persisted.
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })
  async createAuditLog(orderId: string, action: string): Promise<void> {
    this.logger.log(`Audit: ${action} on order ${orderId}`);

    // This runs in a separate transaction - commits independently
    await this.orderRepo.query(
      'INSERT INTO audit_logs (order_id, action) VALUES ($1, $2)',
      [orderId, action],
    );
  }

  /**
   * Find order by ID - NOT wrapped in a transaction (opted-out).
   *
   * Read-only operations don't need transaction overhead.
   */
  @NoTransactional()
  async findById(id: string): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { id } });
  }

  /**
   * List all orders - NOT wrapped in a transaction (opted-out).
   */
  @NoTransactional()
  async findAll(): Promise<Order[]> {
    return this.orderRepo.find();
  }

  /**
   * Transfer between orders - demonstrates NESTED propagation (savepoints).
   *
   * If the nested operation fails, only the savepoint is rolled back,
   * not the entire parent transaction.
   */
  @Transactional({ propagation: TransactionPropagation.NESTED })
  async adjustOrderAmount(orderId: string, adjustment: number): Promise<void> {
    this.logger.log(`Adjusting order ${orderId} amount by ${adjustment}`);

    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    await this.orderRepo.update(orderId, {
      amount: order.amount + adjustment,
    });
  }
}
