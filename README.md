# @bytekit/autofetch

A TypeScript-first, decorator-based HTTP client for building elegant and modular API clients with fetch under the hood. Inspired by Spring's `@RestClient` and OpenFeign.

## Features

- 🧩 Class-based HTTP client with decorators
- 🎯 Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and more
- ⚙️ Middleware support via interceptors
- 🔁 Caching support and hooks for before/after execution
- 🧵 Works with native `fetch` and streams/blobs
- 🧪 Fully typed and extensible

## Installation

```bash
npm install @bytekit/autofetch
```
or
```bash
yarn add @bytekit/autofetch
```

## Quick Example

```ts
import {
  Client,
  GetMapping,
  PostMapping,
  BodyParam,
  PathParam,
  QueryParam,
} from "@bytekit/autofetch";

interface User {
  id: string;
  name: string;
  email: string;
}

@Client({
  baseUrl: () => "https://api.example.com",
  before: (self, url, init, id) => {
    console.log(`[${id}] Requesting ${init.method} ${url} ${init.body}`);
  },
  after: (self, response, id) => {
    console.log(`[${id}] Got response`, response);
  },
})
class UserService {
  @GetMapping({ value: "/users" })
  async getUsers(): Promise<User[]> {
    return [];
  }

  @GetMapping({ value: "/users/:id" })
  async getUser(@PathParam("id") id: string): Promise<User> {
    return {} as User;
  }

  @PostMapping({ value: "/users" })
  async createUser(@BodyParam user: Omit<User, "id">): Promise<User> {
    return {} as User;
  }

  @GetMapping({ value: "/users/search" })
  async searchUsers(
    @QueryParam("q") query: string,
    @QueryParam({ name: "limit", required: false }) limit?: number
  ): Promise<User[]> {
    return [];
  }
}

// Usage
const service = new UserService();

const run = async () => {
  const newUser = await service.createUser({
    name: "Alice",
    email: "alice@example.com",
  });

  const user = await service.getUser(newUser.id);
  const users = await service.getUsers();
  const searchResults = await service.searchUsers("ali", 10);
};
```

## Decorators

### Class Decorators

`@Client(options)`
Marks a class as an API client.

### Method Decorators

- `@GetMapping({ value })`
- `@PostMapping({ value })`
- `@PutMapping({ value })`
- `@PatchMapping({ value })`
- `@DeleteMapping({ value })`

### Parameter Decorators

- `@BodyParam` — binds the request body
- `@PathParam(name)` — binds a URL path parameter
- `@QueryParam(name | { name, required })` — binds query parameters
- `@HeaderParam(name)` — binds a header
- `@FormParam(name)` — binds form fields (for multipart/form-data)
- `@URLEncodedFormParam(name)` — binds form fields (for application/x-www-form-urlencoded)
- `@Init` — accesses the `RequestInit` object for dynamic tweaking

## Advanced Options

- Interceptors: inject `RequestInit` at the client or method level
- Hooks: `before` and `after` functions for logging, auth, etc.
- Streaming: `stream: true` on `@Mapping` returns the raw response stream
- Blobs: `blob: true` for binary payloads
- Custom Fetch: swap in your own fetch implementation

