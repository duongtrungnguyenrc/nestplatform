import { Injectable } from "@nestjs/common";

import { FetchService } from "@nestplatform/feign";

/**
 * Traditional Fetch Mode — uses FetchService programmatically
 * Similar to using axios or node-fetch directly, but with NestJS DI
 */
@Injectable()
export class FetchExampleService {
  constructor(private readonly fetchService: FetchService) {}

  // ─── Users CRUD ───────────────────────────────────────

  async getAllUsers() {
    return this.fetchService.get("/users");
  }

  async getUserById(id: number) {
    return this.fetchService.get(`/users/${id}`);
  }

  async createUser(data: { name: string; email: string; role: string }) {
    return this.fetchService.post("/users", data);
  }

  async updateUser(id: number, data: { name?: string; email?: string; role?: string }) {
    return this.fetchService.put(`/users/${id}`, data);
  }

  async patchUser(id: number, data: Partial<{ name: string; email: string; role: string }>) {
    return this.fetchService.patch(`/users/${id}`, data);
  }

  async deleteUser(id: number) {
    return this.fetchService.delete(`/users/${id}`);
  }

  // ─── Posts CRUD ───────────────────────────────────────

  async getAllPosts() {
    return this.fetchService.get("/posts");
  }

  async getPostById(id: number) {
    return this.fetchService.get(`/posts/${id}`);
  }

  async getPostsByUser(userId: number) {
    return this.fetchService.get("/posts", { queries: { userId } });
  }

  async createPost(data: { title: string; body: string; userId: number }) {
    return this.fetchService.post("/posts", data);
  }

  async updatePost(id: number, data: { title?: string; body?: string }) {
    return this.fetchService.patch(`/posts/${id}`, data);
  }

  async deletePost(id: number) {
    return this.fetchService.delete(`/posts/${id}`);
  }

  // ─── Comments ─────────────────────────────────────────

  async getCommentsByPost(postId: number) {
    return this.fetchService.get("/comments", { queries: { postId } });
  }

  async createComment(data: { body: string; postId: number; userId: number }) {
    return this.fetchService.post("/comments", data);
  }

  // ─── Advanced: Custom options per request ─────────────

  async getUserWithCustomTimeout(id: number) {
    return this.fetchService.get(`/users/${id}`, {
      timeoutMs: 10000,
      retryCount: 5,
      retryDelayMs: 200,
      headers: { "X-Custom-Header": "custom-value" },
    });
  }

  async getRawResponse() {
    return this.fetchService.get("/users", { rawResponse: true });
  }
}
