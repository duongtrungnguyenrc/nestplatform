import { Injectable } from "@nestjs/common";

import { FeignClient, Get, Post, Put, Patch, Delete, Params, Queries, Body } from "@nestplatform/feign";

/**
 * Declarative Feign Client for Users API
 * Uses @FeignClient decorator — similar to Spring Cloud OpenFeign
 * No manual HTTP logic needed — methods are auto-wired at runtime
 */
@Injectable()
@FeignClient({
  name: "jsonServer",
  path: "/users",
})
export class UserFeignClient {
  @Get("/")
  async findAll(): Promise<any[]> {
    return undefined as any; // method body replaced at runtime by feign
  }

  @Get("/:id")
  async findById(@Params() params: { id: number }): Promise<any> {
    return undefined as any;
  }

  @Get("/")
  async findByRole(@Queries() query: { role: string }): Promise<any[]> {
    return undefined as any;
  }

  @Post("/")
  async create(@Body() body: { name: string; email: string; role: string }): Promise<any> {
    return undefined as any;
  }

  @Put("/:id")
  async update(@Params() params: { id: number }, @Body() body: { name: string; email: string; role: string }): Promise<any> {
    return undefined as any;
  }

  @Patch("/:id")
  async patch(@Params() params: { id: number }, @Body() body: Partial<{ name: string; email: string; role: string }>): Promise<any> {
    return undefined as any;
  }

  @Delete("/:id")
  async remove(@Params() params: { id: number }): Promise<any> {
    return undefined as any;
  }
}
