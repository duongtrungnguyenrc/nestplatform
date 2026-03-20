import { Injectable } from "@nestjs/common";

import { FeignClient, Get, Post, Patch, Delete, Params, Queries, Body } from "@nestplatform/feign";

/**
 * Declarative Feign Client for Posts API
 * Demonstrates path prefix + method-level paths
 */
@Injectable()
@FeignClient({
  name: "jsonServer",
  path: "/posts",
})
export class PostFeignClient {
  @Get("/")
  async findAll(): Promise<any[]> {
    return undefined as any;
  }

  @Get("/:id")
  // @ts-ignore
  async findById(@Params() params: { id: number }): Promise<any> {}

  @Get("/")
  async findByUser(@Queries() query: { userId: number }): Promise<any[]> {
    return undefined as any;
  }

  @Post("/")
  async create(@Body() body: { title: string; body: string; userId: number }): Promise<any> {
    return undefined as any;
  }

  @Patch("/:id")
  async update(@Params() params: { id: number }, @Body() body: { title?: string; body?: string }): Promise<any> {
    return undefined as any;
  }

  @Delete("/:id")
  async remove(@Params() params: { id: number }): Promise<any> {
    return undefined as any;
  }
}
