import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Put, Query } from "@nestjs/common";

import { FetchExampleService } from "./fetch-example.service.js";

/**
 * Traditional Fetch Mode Controller
 * Endpoints prefixed with /fetch/...
 */
@Controller("fetch")
export class FetchExampleController {
  private readonly logger = new Logger(FetchExampleController.name);

  constructor(private readonly fetchExampleService: FetchExampleService) {}

  // ─── Users ────────────────────────────────────────────

  @Get("users")
  async getAllUsers() {
    this.logger.log("[Fetch Mode] GET /users");
    return this.fetchExampleService.getAllUsers();
  }

  @Get("users/:id")
  async getUserById(@Param("id") id: string) {
    this.logger.log(`[Fetch Mode] GET /users/${id}`);
    return this.fetchExampleService.getUserById(Number(id));
  }

  @Post("users")
  async createUser(@Body() body: { name: string; email: string; role: string }) {
    this.logger.log("[Fetch Mode] POST /users");
    return this.fetchExampleService.createUser(body);
  }

  @Put("users/:id")
  async updateUser(@Param("id") id: string, @Body() body: { name?: string; email?: string; role?: string }) {
    this.logger.log(`[Fetch Mode] PUT /users/${id}`);
    return this.fetchExampleService.updateUser(Number(id), body);
  }

  @Patch("users/:id")
  async patchUser(@Param("id") id: string, @Body() body: Partial<{ name: string; email: string; role: string }>) {
    this.logger.log(`[Fetch Mode] PATCH /users/${id}`);
    return this.fetchExampleService.patchUser(Number(id), body);
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    this.logger.log(`[Fetch Mode] DELETE /users/${id}`);
    return this.fetchExampleService.deleteUser(Number(id));
  }

  // ─── Posts ────────────────────────────────────────────

  @Get("posts")
  async getAllPosts(@Query("userId") userId?: string) {
    if (userId) {
      this.logger.log(`[Fetch Mode] GET /posts?userId=${userId}`);
      return this.fetchExampleService.getPostsByUser(Number(userId));
    }
    this.logger.log("[Fetch Mode] GET /posts");
    return this.fetchExampleService.getAllPosts();
  }

  @Get("posts/:id")
  async getPostById(@Param("id") id: string) {
    this.logger.log(`[Fetch Mode] GET /posts/${id}`);
    return this.fetchExampleService.getPostById(Number(id));
  }

  @Post("posts")
  async createPost(@Body() body: { title: string; body: string; userId: number }) {
    this.logger.log("[Fetch Mode] POST /posts");
    return this.fetchExampleService.createPost(body);
  }

  @Patch("posts/:id")
  async updatePost(@Param("id") id: string, @Body() body: { title?: string; body?: string }) {
    this.logger.log(`[Fetch Mode] PATCH /posts/${id}`);
    return this.fetchExampleService.updatePost(Number(id), body);
  }

  @Delete("posts/:id")
  async deletePost(@Param("id") id: string) {
    this.logger.log(`[Fetch Mode] DELETE /posts/${id}`);
    return this.fetchExampleService.deletePost(Number(id));
  }

  // ─── Comments ─────────────────────────────────────────

  @Get("comments")
  async getCommentsByPost(@Query("postId") postId: string) {
    this.logger.log(`[Fetch Mode] GET /comments?postId=${postId}`);
    return this.fetchExampleService.getCommentsByPost(Number(postId));
  }

  @Post("comments")
  async createComment(@Body() body: { body: string; postId: number; userId: number }) {
    this.logger.log("[Fetch Mode] POST /comments");
    return this.fetchExampleService.createComment(body);
  }

  // ─── Advanced ─────────────────────────────────────────

  @Get("advanced/user-timeout/:id")
  async getUserWithCustomTimeout(@Param("id") id: string) {
    this.logger.log(`[Fetch Mode] GET /users/${id} with custom timeout`);
    return this.fetchExampleService.getUserWithCustomTimeout(Number(id));
  }

  @Get("advanced/raw")
  async getRawResponse() {
    this.logger.log("[Fetch Mode] GET /users (raw response)");
    const response = await this.fetchExampleService.getRawResponse();
    return {
      status: (response as any).status,
      statusText: (response as any).statusText,
      headers: Object.fromEntries((response as any).headers.entries()),
    };
  }
}
