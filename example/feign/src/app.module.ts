import { Module } from "@nestjs/common";

import { FeignModule } from "@nestplatform/feign";

import { FetchExampleModule } from "./fetch-example/fetch-example.module.js";
import { FeignExampleModule } from "./feign-example/feign-example.module.js";

@Module({
  imports: [
    // Core feign module (global — enables @FeignClient scanning)
    FeignModule,

    // Example modules
    FetchExampleModule,
    FeignExampleModule,
  ],
})
export class AppModule {}
