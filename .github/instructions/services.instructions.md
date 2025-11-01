---
applyTo: "features/*/services/*.service.ts"
---

# Service Layer Instructions

## Purpose

Service files contain API integration logic - domain-specific API wrappers that handle HTTP communication.

## Structure Pattern

```typescript
/**
 * [Domain] Service
 * Handles all [domain]-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { [Type], [TypeFilter] } from "@/types";

export const [domain]Api = {
  /**
   * Fetch all [items]
   */
  async getAll(filters?: [TypeFilter]): Promise<[Type][]> {
    return apiGet<[Type][]>("/[endpoint]");
  },

  /**
   * Fetch single [item] by ID
   */
  async getById(id: string): Promise<[Type]> {
    return apiGet<[Type]>(`/[endpoint]/${id}`);
  },

  /**
   * Create new [item]
   */
  async create(data: Omit<[Type], "id">): Promise<[Type]> {
    return apiPost<[Type]>("/[endpoint]", data);
  },

  /**
   * Update [item]
   */
  async update(id: string, data: Partial<[Type]>): Promise<[Type]> {
    return apiPatch<[Type]>(`/[endpoint]/${id}`, data);
  },

  /**
   * Delete [item]
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/[endpoint]/${id}`);
  },
};
```

## Requirements

1. **Always use helper functions** from `lib/api-client.ts`:

   - `apiGet<T>()` - GET requests
   - `apiPost<T>()` - POST requests
   - `apiPatch<T>()` - PATCH/PUT requests
   - `apiDelete<T>()` - DELETE requests

2. **Always type responses**:

   ```typescript
   return apiGet<Product[]>("/products"); // ✅ Typed
   return apiGet("/products"); // ❌ Untyped
   ```

3. **Organize by HTTP method**:

   - getAll() first (with filters if applicable)
   - getById() next
   - create()
   - update() / updateStatus() / specific updates
   - delete() / specific delete methods

4. **Include JSDoc comments** for each method:

   ```typescript
   /**
    * Fetch all products with optional filters
    * @param filters - Product filter criteria
    * @returns Array of products
    */
   async getAll(filters?: ProductFilters): Promise<Product[]> { ... }
   ```

5. **Query parameters** for complex filters:
   ```typescript
   const params = new URLSearchParams();
   if (filters?.category) params.append("category", filters.category);
   const endpoint = `/products${params.toString() ? `?${params}` : ""}`;
   return apiGet<Product[]>(endpoint);
   ```

## Examples

### Products Service

```typescript
export const productsApi = {
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;
    return apiGet<Product[]>(endpoint);
  },

  async getById(id: string): Promise<Product> {
    return apiGet<Product>(`/products/${id}`);
  },

  async create(data: Omit<Product, "id">): Promise<Product> {
    return apiPost<Product>("/products", data);
  },

  async getFeatured(): Promise<Product[]> {
    return apiGet<Product[]>("/products/featured");
  },
};
```

### Orders Service

```typescript
export const ordersApi = {
  async getAll(userId: string): Promise<Order[]> {
    return apiGet<Order[]>(`/orders?userId=${userId}`);
  },

  async getById(id: string): Promise<Order> {
    return apiGet<Order>(`/orders/${id}`);
  },

  async create(data: Omit<Order, "id">): Promise<Order> {
    return apiPost<Order>("/orders", data);
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    return apiPatch<Order>(`/orders/${id}`, { status });
  },

  async cancel(id: string): Promise<Order> {
    return apiPatch<Order>(`/orders/${id}/cancel`, {});
  },
};
```

## Do's & Don'ts

✅ **Do:**

- Use typed generic parameters: `apiGet<Product[]>()`
- Keep methods simple and focused
- Export single `const [domain]Api` object
- Use JSDoc for documentation
- Handle query params cleanly

❌ **Don't:**

- Hardcode URLs: `fetch("http://localhost:3000/products")`
- Mix multiple domains in one service
- Add UI logic (toasts, state management) - Keep pure
- Throw custom errors - Let apiClient handle errors
- Put service logic in components or hooks

## Import Paths

✅ **Correct:**

```typescript
import { apiGet, apiPost } from "@/lib/api-client";
import type { Product } from "@/types";
```

❌ **Avoid:**

```typescript
import axios from "axios"; // Use apiGet instead
import * from "@/lib/api-client"; // Be specific
```
