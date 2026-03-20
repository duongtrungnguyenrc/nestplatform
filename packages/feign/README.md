# @nestplatform/feign

`@nestplatform/feign` is a declarative HTTP client library for NestJS inspired by Spring Cloud OpenFeign. It simplifies the process of making HTTP requests by allowing you to define clients as interfaces or abstract classes with decorators. 

It uses a powerful, configurable underlying `FetchService` by default but allows you to swap in custom fetchers if needed.

## Installation

```bash
npm install @nestplatform/feign @nestplatform/common
```

## Features

- **Declarative REST Clients**: Define HTTP clients using TypeScript classes and decorators, completely removing boilerplate HTTP request code.
- **Built-in Fetcher**: Automatically integrates with a robust built-in `FetchService` (which supports retries, timeouts, credentials, and custom headers out-of-the-box).
- **Flexible & Pluggable**: You can provide your own HTTP fetcher logic behind the scenes if the default fetcher does not fit your use case.
- **Interceptors**: Supports request and response interceptors to manipulate flows globally.

## Quick Start

### 1. Register the module

Import `FeignClientModule` in your root or feature module. This registers the client and automatically wires up the default underlying fetcher.

```typescript
import { Module } from "@nestjs/common";
import { FeignClientModule } from "@nestplatform/feign";
import { UserFeignClient } from "./user.client";

@Module({
    imports: [
        FeignClientModule.register({
            name: "jsonServer", // The client identifier
            url: "http://localhost:3000", // Base URL
            timeoutMs: 5000,
            retryCount: 3,
            retryDelayMs: 1000,
            logging: "summary",
            defaultHeaders: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        }),
    ],
    providers: [UserFeignClient], // Don't forget to provide your client!
})
export class AppModule {}
```

#### Async Configuration

You can also use `.registerAsync` if you need to load values from a configuration service asynchronously:

```typescript
FeignClientModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        name: "jsonServer",
        url: configService.get("API_URL"),
    }),
});
```

### 2. Define the Feign Client

Create an injectable class and decorate it with `@FeignClient`. Define methods with HTTP verb decorators and specify parameters using argument decorators.

*Note: The actual implementation logic inside the methods will be automatically replaced by the framework at runtime.*

```typescript
import { Injectable } from "@nestjs/common";
import { FeignClient, Get, Post, Put, Patch, Delete, Params, Queries, Body, Headers } from "@nestplatform/feign";

@Injectable()
@FeignClient({
    name: "jsonServer", // Must match the name defined in the module registration
    path: "/users",     // Base path for all methods in this client
})
export class UserFeignClient {
    
    @Get("/")
    async findAll(): Promise<any[]> {
        return undefined as any; 
    }

    @Get("/:id")
    async findById(@Params() params: { id: number }): Promise<any> {
        return undefined as any;
    }

    @Get("/")
    async findByRole(@Queries() query: { role: string }): Promise<any[]> {
        return undefined as any;
    }

    @Post("/")
    async create(@Body() body: { name: string; email: string; role: string }): Promise<any> {
        return undefined as any;
    }

    @Put("/:id")
    async update(@Params() params: { id: number }, @Body() body: { name: string; email: string; role: string }): Promise<any> {
        return undefined as any;
    }

    @Patch("/:id")
    async patch(@Params() params: { id: number }, @Body() body: Partial<{ name: string; email: string; role: string }>): Promise<any> {
        return undefined as any;
    }

    @Delete("/:id")
    async remove(@Params() params: { id: number }): Promise<any> {
        return undefined as any;
    }
}
```

### 3. Usage

Inject your client into any service or controller as you would a normal NestJS provider.

```typescript
import { Controller, Get } from "@nestjs/common";
import { UserFeignClient } from "./user.client";

@Controller("users")
export class UserController {
    constructor(private readonly userClient: UserFeignClient) {}

    @Get()
    async getUsers() {
        return this.userClient.findAll();
    }
}
```

## API Reference

### Module Options (`FeignClientConfig`)

Passed into `FeignClientModule.register(config)`:

- `name` (string): Unique identifier for this feign client. Must match the name in `@FeignClient`.
- `fetcher` (FeignFetcher, optional): Supply a custom fetcher function or class. Defaults to the built-in `FetchService`.
- `url` (string, optional): Base URL for the target API.
- `path` (string, optional): Base path prefix for all endpoints.
- `timeoutMs` (number, optional): Timeout threshold in milliseconds.
- `defaultHeaders` (object, optional): Default headers appended to every request.
- `retryCount` (number, optional): Number of retry attempts on failure.
- `retryDelayMs` (number, optional): Delay between retry attempts.
- `logging` ("summary" | "full" | "none", optional): Determines how much detail is logged.

### Class Decorators

#### `@FeignClient(options: FeignClientOptions)`
Decorates your API wrapper class.
- `name` (string): Links to the configuration defined in module.
- `url` (string, optional): Base URL (overrides module config).
- `path` (string, optional): Path prefix (e.g. `"/api/v1"`).

### Method Decorators

Defines the HTTP route.
- `@Get(path: string)`
- `@Post(path: string)`
- `@Put(path: string)`
- `@Patch(path: string)`
- `@Delete(path: string)`

### Parameter Decorators

Binds arguments to the underlying request components.

- `@Params()`: Binds path parameters (e.g., `/:id`).
- `@Queries()`: Binds query string parameters (e.g., `?role=admin`).
- `@Body()`: Binds the HTTP request body.
- `@Headers()`: Binds runtime HTTP headers. 

*(Note: The bound object must perfectly align with the expected type or structure of that segment).*

## License
MIT
