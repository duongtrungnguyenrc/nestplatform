import { Controller, Get, Post, Param, Body, Delete } from "@nestjs/common";
import { ProductService, Product } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Product | undefined> {
    return this.productService.getProduct(id);
  }

  @Post(":id")
  async update(@Param("id") id: string, @Body() body: { name: string; price: number }): Promise<Product> {
    return this.productService.updateProduct(id, body.name, body.price);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  @Post("clear-cache")
  async clearCache(): Promise<void> {
    return this.productService.clearAllProductsCache();
  }
}
