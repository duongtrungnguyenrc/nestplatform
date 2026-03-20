import { Controller, Get, Post, Param, Body } from '@nestjs/common';

import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() body: { productName: string; amount: number }) {
    return this.orderService.createOrder(body.productName, body.amount);
  }

  @Post('with-event')
  async createOrderWithEvent(
    @Body() body: { productName: string; amount: number },
  ) {
    return this.orderService.createOrderWithEvent(
      body.productName,
      body.amount,
    );
  }

  @Post('audit')
  async createAuditLog(@Body() body: { orderId: string; action: string }) {
    return this.orderService.createAuditLog(body.orderId, body.action);
  }

  @Post('adjust')
  async adjustOrderAmount(
    @Body() body: { orderId: string; adjustment: number },
  ) {
    return this.orderService.adjustOrderAmount(body.orderId, body.adjustment);
  }

  @Post('create-declarative')
  async createOrderDeclarative(
    @Body() body: { productName: string; amount: number },
  ) {
    return this.orderService.createOrderDeclarative(
      body.productName,
      body.amount,
    );
  }

  @Post('test-rollback')
  async testRollback() {
    return this.orderService.processWithConditionalRollback();
  }

  @Post('test-explicit-rollback')
  async testExplicitRollback(
    @Body() body: { productName: string; amount: number },
  ) {
    return this.orderService.createOrderWithRollback(
      body.productName,
      body.amount,
    );
  }

  @Get()
  async findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }
}
