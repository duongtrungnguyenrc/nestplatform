import { Injectable, Logger } from "@nestjs/common";
import { Cacheable, CachePut, CacheEvict } from "@nestplatform/cacheable";

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private products: Product[] = [
    { id: "1", name: "iPhone 15", price: 999 },
    { id: "2", name: "MacBook Pro", price: 1999 },
  ];

  @Cacheable({
    key: (id: string) => `product:${id}`,
    ttl: "1m",
    namespace: "inventory",
  })
  async getProduct(id: string): Promise<Product | undefined> {
    this.logger.log(`Fetching product ${id} from database...`);
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.products.find((p) => p.id === id);
  }

  @CachePut({
    key: (id: string) => `product:${id}`,
    ttl: "1m",
    namespace: "inventory",
  })
  async updateProduct(id: string, name: string, price: number): Promise<Product> {
    this.logger.log(`Updating product ${id} in database...`);
    const index = this.products.findIndex((p) => p.id === id);
    const updatedProduct = { id, name, price };
    if (index !== -1) {
      this.products[index] = updatedProduct;
    } else {
      this.products.push(updatedProduct);
    }
    return updatedProduct;
  }

  @CacheEvict({
    key: (id: string) => `product:${id}`,
    namespace: "inventory",
  })
  async deleteProduct(id: string): Promise<void> {
    this.logger.log(`Deleting product ${id} from database...`);
    this.products = this.products.filter((p) => p.id !== id);
  }

  @Cacheable({
    key: "all-products",
    ttl: "30s",
  })
  async getAllProducts(): Promise<Product[]> {
    this.logger.log("Fetching all products from database...");
    return this.products;
  }

  @CacheEvict({
    key: "all-products",
  })
  async clearAllProductsCache(): Promise<void> {
    this.logger.log("Clearing all products cache...");
  }
}
