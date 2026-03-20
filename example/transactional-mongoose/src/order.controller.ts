import { Body, Controller, Post } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Order } from "./order.schema";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body("productName") productName: string, @Body("amount") amount: number): Promise<Order> {
    return this.orderService.createOrder(productName, amount);
  }

  @Post("requires-new")
  async createOrderRequiresNew(@Body("productName") productName: string, @Body("amount") amount: number): Promise<Order> {
    return this.orderService.createOrderRequiresNew(productName, amount);
  }

  @Post("rollback")
  async createOrderWithRollback(@Body("productName") productName: string, @Body("amount") amount: number): Promise<Order> {
    return this.orderService.createOrderWithRollback(productName, amount);
  }

  @Post("conditional-rollback")
  async createOrderWithConditionalRollback(
    @Body("productName") productName: string,
    @Body("amount") amount: number,
    @Body("shouldTypeMatch") shouldTypeMatch: boolean,
  ): Promise<Order> {
    return this.orderService.createOrderWithConditionalRollback(productName, amount, shouldTypeMatch);
  }

  @Post("create-declarative")
  async createOrderDeclarative(@Body("productName") productName: string, @Body("amount") amount: number): Promise<Order> {
    return this.orderService.createOrderDeclarative(productName, amount);
  }

  @Post("audit")
  async createAuditLog(@Body("orderId") orderId: string, @Body("action") action: string): Promise<void> {
    return this.orderService.createAuditLog(orderId, action);
  }

  @Post("adjust")
  async adjustOrderAmount(@Body("orderId") orderId: string, @Body("adjustment") adjustment: number): Promise<void> {
    return this.orderService.adjustOrderAmount(orderId, adjustment);
  }
}
