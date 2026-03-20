import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Put, Query } from "@nestjs/common";

import { UserFeignClient } from "./clients/user-feign.client.js";
import { PostFeignClient } from "./clients/post-feign.client.js";
import { CommentFeignClient } from "./clients/comment-feign.client.js";

/**
 * Declarative Feign Mode Controller
 * Endpoints prefixed with /feign/...
 * Uses @FeignClient-decorated classes instead of manual FetchService calls
 */
@Controller("feign")
export class FeignExampleController {
  private readonly logger = new Logger(FeignExampleController.name);

  constructor(
    private readonly userClient: UserFeignClient,
    private readonly postClient: PostFeignClient,
    private readonly commentClient: CommentFeignClient,
  ) {}

  // ─── Users ────────────────────────────────────────────

  @Get("users")
  async getAllUsers() {
    this.logger.log("[Feign Mode] GET /users");
    return this.userClient.findAll();
  }

  @Get("users/:id")
  async getUserById(@Param("id") id: string) {
    this.logger.log(`[Feign Mode] GET /users/${id}`);
    return this.userClient.findById({ id: Number(id) });
  }

  @Get("users/role/:role")
  async getUsersByRole(@Param("role") role: string) {
    this.logger.log(`[Feign Mode] GET /users?role=${role}`);
    return this.userClient.findByRole({ role });
  }

  @Post("users")
  async createUser(@Body() body: { name: string; email: string; role: string }) {
    this.logger.log("[Feign Mode] POST /users");
    return this.userClient.create(body);
  }

  @Put("users/:id")
  async updateUser(@Param("id") id: string, @Body() body: { name: string; email: string; role: string }) {
    this.logger.log(`[Feign Mode] PUT /users/${id}`);
    return this.userClient.update({ id: Number(id) }, body);
  }

  @Patch("users/:id")
  async patchUser(@Param("id") id: string, @Body() body: Partial<{ name: string; email: string; role: string }>) {
    this.logger.log(`[Feign Mode] PATCH /users/${id}`);
    return this.userClient.patch({ id: Number(id) }, body);
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    this.logger.log(`[Feign Mode] DELETE /users/${id}`);
    return this.userClient.remove({ id: Number(id) });
  }

  // ─── Posts ────────────────────────────────────────────

  @Get("posts")
  async getAllPosts(@Query("userId") userId?: string) {
    if (userId) {
      this.logger.log(`[Feign Mode] GET /posts?userId=${userId}`);
      return this.postClient.findByUser({ userId: Number(userId) });
    }
    this.logger.log("[Feign Mode] GET /posts");
    return this.postClient.findAll();
  }

  @Get("posts/:id")
  async getPostById(@Param("id") id: string) {
    this.logger.log(`[Feign Mode] GET /posts/${id}`);
    return this.postClient.findById({ id: Number(id) });
  }

  @Post("posts")
  async createPost(@Body() body: { title: string; body: string; userId: number }) {
    this.logger.log("[Feign Mode] POST /posts");
    return this.postClient.create(body);
  }

  @Patch("posts/:id")
  async updatePost(@Param("id") id: string, @Body() body: { title?: string; body?: string }) {
    this.logger.log(`[Feign Mode] PATCH /posts/${id}`);
    return this.postClient.update({ id: Number(id) }, body);
  }

  @Delete("posts/:id")
  async deletePost(@Param("id") id: string) {
    this.logger.log(`[Feign Mode] DELETE /posts/${id}`);
    return this.postClient.remove({ id: Number(id) });
  }

  // ─── Comments ─────────────────────────────────────────

  @Get("comments")
  async getCommentsByPost(@Query("postId") postId: string) {
    this.logger.log(`[Feign Mode] GET /comments?postId=${postId}`);
    return this.commentClient.findByPost({ postId: Number(postId) });
  }

  @Post("comments")
  async createComment(@Body() body: { body: string; postId: number; userId: number }) {
    this.logger.log("[Feign Mode] POST /comments");
    return this.commentClient.create(body);
  }
}
