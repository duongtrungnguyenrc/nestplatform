import { Controller, Get, Post, Param, Body } from '@nestjs/common';

import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() body: { productName: string; amount: number }) {
    return this.orderService.createOrder(body.productName, body.amount);
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
