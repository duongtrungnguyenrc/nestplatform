import { Module } from "@nestjs/common";
import { CacheableModule } from "@nestplatform/cacheable";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";

@Module({
  imports: [
    // Register CacheableModule with some default settings
    CacheableModule.register({
      ttl: 60000, // Default 60 seconds
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class AppModule {}
