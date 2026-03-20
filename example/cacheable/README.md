# Cacheable Example

This is an example project demonstrating the usage of `@nestplatform/cacheable`.

## Getting Started

### Installation

From the project root:

```bash
npm install
```

### Running the Example

```bash
cd example/cacheable
npm run start:dev
```

## Testing the Caching Behavior

The example provides a `ProductService` with caching decorators. You can test it using the following endpoints:

### 1. Get All Products (Cached for 30s)
First call will hit the service, subsequent calls within 30s will be cached.
```bash
curl http://localhost:3000/products
```

### 2. Get Single Product (Cached for 1m, Namespace: inventory)
```bash
curl http://localhost:3000/products/1
```

### 3. Update Product (Updates Cache using @CachePut)
This will refresh the cache entry for the specific product.
```bash
curl -X POST http://localhost:3000/products/1 -H "Content-Type: application/json" -d '{"name": "iPhone 15 Pro", "price": 1099}'
```

### 4. Delete Product (Evicts Cache using @CacheEvict)
This will remove the product and its cache entry.
```bash
curl -X DELETE http://localhost:3000/products/1
```

### 5. Clear All Products Cache
```bash
curl -X POST http://localhost:3000/products/clear-cache
```

## Key Features Demonstrated

- **@Cacheable**: Basic caching with auto-generated and manual keys.
- **@CachePut**: Refreshing specific cache entries.
- **@CacheEvict**: Removing specific or multiple cache entries.
- **Namespaces**: Using `namespace` to prefix cache keys.
- **Dynamic TTL**: Using string durations like `'1m'` or `'30s'`.
- **Key Builders**: Using functions to generate keys based on arguments.
