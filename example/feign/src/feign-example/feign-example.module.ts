import { Module } from "@nestjs/common";

import { FeignClientModule } from "@nestplatform/feign";

import { UserFeignClient } from "./clients/user-feign.client.js";
import { PostFeignClient } from "./clients/post-feign.client.js";
import { CommentFeignClient } from "./clients/comment-feign.client.js";
import { FeignExampleController } from "./feign-example.controller.js";

@Module({
  imports: [
    // Register feign client — FetchService is auto-created as the default fetcher
    // No need to manually wire FetchModule + FetchService
    FeignClientModule.register({
      name: "jsonServer",
      url: "http://localhost:3001",
      timeoutMs: 5000,
      retryCount: 2,
      retryDelayMs: 500,
      logging: "summary",
      defaultHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
  ],
  controllers: [FeignExampleController],
  providers: [UserFeignClient, PostFeignClient, CommentFeignClient],
})
export class FeignExampleModule {}
