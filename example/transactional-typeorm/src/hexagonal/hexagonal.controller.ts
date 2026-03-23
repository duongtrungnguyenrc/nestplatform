import { Controller, Post, Get, Body } from '@nestjs/common';
import { UserService } from './core/application/user.service';

@Controller('hexagonal')
export class HexagonalController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(@Body() createDto: { name: string; email: string }) {
    return this.userService.createUser(createDto.name, createDto.email);
  }

  @Get('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
