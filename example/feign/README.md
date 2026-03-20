# REST Client Example

This example demonstrates both modes of `@nestplatform/feign`:

1. **Fetch Mode** (`/fetch/...`) — Traditional programmatic HTTP calls using `FetchService`
2. **Feign Mode** (`/feign/...`) — Declarative API clients using `@FeignClient` decorators

Both modes call the same mock API powered by [json-server](https://github.com/typicode/json-server).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start json-server mock API (runs on port 3001)
npm run start:mock

# 3. In another terminal, start the NestJS app (runs on port 3000)
npm run start:dev
```

## API Endpoints

### Fetch Mode (Traditional)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/fetch/users` | Get all users |
| GET    | `/fetch/users/:id` | Get user by ID |
| POST   | `/fetch/users` | Create user |
| PUT    | `/fetch/users/:id` | Full update user |
| PATCH  | `/fetch/users/:id` | Partial update user |
| DELETE | `/fetch/users/:id` | Delete user |
| GET    | `/fetch/posts` | Get all posts |
| GET    | `/fetch/posts?userId=1` | Get posts by user |
| POST   | `/fetch/posts` | Create post |
| GET    | `/fetch/comments?postId=1` | Get comments by post |

### Feign Mode (Declarative)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/feign/users` | Get all users |
| GET    | `/feign/users/:id` | Get user by ID |
| POST   | `/feign/users` | Create user |
| PUT    | `/feign/users/:id` | Full update user |
| PATCH  | `/feign/users/:id` | Partial update user |
| DELETE | `/feign/users/:id` | Delete user |
| GET    | `/feign/posts` | Get all posts |
| GET    | `/feign/posts?userId=1` | Get posts by user |
| POST   | `/feign/posts` | Create post |
| GET    | `/feign/comments?postId=1` | Get comments by post |

## Test Examples

```bash
# Fetch mode
curl http://localhost:3000/fetch/users
curl -X POST http://localhost:3000/fetch/users -H "Content-Type: application/json" -d '{"name":"Dave","email":"dave@example.com","role":"user"}'

# Feign mode (same results, different implementation)
curl http://localhost:3000/feign/users
curl -X POST http://localhost:3000/feign/users -H "Content-Type: application/json" -d '{"name":"Dave","email":"dave@example.com","role":"user"}'
```
