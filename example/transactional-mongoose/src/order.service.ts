import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./order.schema";
import {
  Transactional,
  TransactionalEvent,
  TransactionalEventListener,
  TransactionPhase,
  TransactionPropagation,
  TransactionalEventPublisher,
} from "@nestplatform/transactional";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly eventPublisher: TransactionalEventPublisher,
  ) {}

  /**
   * Simple transactional method.
   */
  @Transactional()
  async createOrder(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order for ${productName}`);

    const order = new this.orderModel({ productName, amount });
    return order.save();
  }

  /**
   * Create an order and publish an event manually.
   */
  @Transactional()
  async createOrderWithEvent(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order (with event) for ${productName}`);

    const order = new this.orderModel({ productName, amount });
    const savedOrder = await order.save();

    // Publish event - will be handled AFTER_COMMIT by default
    await this.eventPublisher.publish("order.created", savedOrder);

    return savedOrder;
  }

  /**
   * Test scenario: REQUIRES_NEW.
   * This will always create a new transaction, even if one exists.
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })
  async createOrderRequiresNew(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order (REQUIRES_NEW) for ${productName}`);
    const order = new this.orderModel({ productName, amount, status: "requires_new" });
    return order.save();
  }

  /**
   * Test scenario: Explicit Rollback.
   * This method always throws an error to trigger a rollback.
   */
  @Transactional()
  async createOrderWithRollback(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order (will rollback) for ${productName}`);
    const order = new this.orderModel({ productName, amount, status: "should_rollback" });
    await order.save();

    throw new Error("Forced rollback for testing");
  }

  /**
   * Test scenario: Conditional Rollback using rollbackOnError.
   * Rollback only if the error matches the criteria.
   */
  @Transactional({ rollbackOnError: "BusinessException" })
  async createOrderWithConditionalRollback(productName: string, amount: number, shouldTypeMatch: boolean): Promise<Order> {
    this.logger.log(`Creating order (conditional rollback) for ${productName}`);
    const order = new this.orderModel({ productName, amount, status: "conditional_rollback" });
    await order.save();

    if (shouldTypeMatch) {
      const error = new Error("Business Error");
      error.name = "BusinessException";
      throw error;
    } else {
      throw new Error("Other Error (should NOT rollback)");
    }
  }

  /**
   * Create an order and publish an event declaratively using @TransactionalEvent.
   */
  @TransactionalEvent("order.created")
  async createOrderDeclarative(productName: string, amount: number): Promise<Order> {
    this.logger.log(`Creating order (declarative event) for ${productName}`);
    const order = new this.orderModel({ productName, amount, status: "declarative" });
    return order.save();
  }

  /**
   * Test scenario: REQUIRES_NEW (Audit log style).
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })
  async createAuditLog(orderId: string, action: string): Promise<void> {
    this.logger.log(`Audit: ${action} on order ${orderId}`);
    // In a real app, this would save to an audit_logs collection
  }

  /**
   * Test scenario: NESTED (falls back to REQUIRED in Mongoose).
   */
  @Transactional({ propagation: TransactionPropagation.NESTED })
  async adjustOrderAmount(orderId: string, adjustment: number): Promise<void> {
    this.logger.log(`Adjusting order ${orderId} amount by ${adjustment}`);
    await this.orderModel.findByIdAndUpdate(orderId, { $inc: { amount: adjustment } });
  }

  /**
   * Transactional Event Listener - runs AFTER_COMMIT by default.
   */
  @TransactionalEventListener("order.created", { phase: TransactionPhase.AFTER_COMMIT })
  async onOrderCreated(order: Order) {
    this.logger.log(`[EVENT] Order ${order._id} committed! Sending confirmation email...`);
  }

  /**
   * Transactional Event Listener - runs AFTER_ROLLBACK.
   */
  @TransactionalEventListener("order.created", { phase: TransactionPhase.AFTER_ROLLBACK })
  async onOrderFailed(order: Order) {
    this.logger.warn(`[EVENT] Order ${order._id} failed! Notifying support...`);
  }
}
