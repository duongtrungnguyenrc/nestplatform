import { Module } from "@nestjs/common";

import { FetchModule } from "@nestplatform/feign";

import { FetchExampleController } from "./fetch-example.controller.js";
import { FetchExampleService } from "./fetch-example.service.js";

@Module({
  imports: [
    // Register FetchModule with json-server base URL
    FetchModule.register({
      baseUrl: "http://localhost:3001",
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
  controllers: [FetchExampleController],
  providers: [FetchExampleService],
})
export class FetchExampleModule {}
