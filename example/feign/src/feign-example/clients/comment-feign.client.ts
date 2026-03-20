import { Injectable } from "@nestjs/common";

import { FeignClient, Get, Post, Queries, Body } from "@nestplatform/feign";

/**
 * Declarative Feign Client for Comments API
 */
@Injectable()
@FeignClient({
  name: "jsonServer",
  path: "/comments",
})
export class CommentFeignClient {
  @Get("/")
  async findByPost(@Queries() query: { postId: number }): Promise<any[]> {
    return undefined as any;
  }

  @Post("/")
  async create(@Body() body: { body: string; postId: number; userId: number }): Promise<any> {
    return undefined as any;
  }
}
