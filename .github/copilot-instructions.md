# GitHub Copilot Repository Instructions

## Project Overview

- **Project**: Frontend Eyewear Store (Next.js 15 + TypeScript)
- **Feature**: API Integration - Connecting frontend to NestJS backend APIs
- **Branch**: feature/api-integration
- **Backend**: NestJS microservices on localhost:3000

## Code Style & Language

### Vietnamese Language

- Respond in Vietnamese
- Use helpful colleague tone, minimize explanations but provide enough context
- Provide TypeScript examples

### Async/Await Priority

**Always use async/await over .then() EXCEPT for parallel Promises:**

✅ **Correct:**

```typescript
// Async/await (default)
const data = await productsApi.getAll();

// useEffect pattern
useEffect(() => {
  const fetch = async () => {
    const data = await productsApi.getAll();
    setData(data);
  };
  fetch();
}, []);

// Parallel operations
const [products, categories] = await Promise.all([
  productsApi.getAll(),
  categoriesApi.getAll(),
]);
```

❌ **Avoid:**

```typescript
// .then() for simple cases
productsApi.getAll().then((data) => setData(data));
```

## Architecture & Project Structure

### Domains (9 Services)

1. **auth** - Login, register, token refresh
2. **users** - User profile, CRUD
3. **addresses** - Shipping addresses
4. **products** - Product catalog
5. **categories** - Product categories
6. **cart** - Shopping cart
7. **orders** - Order management
8. **payments** - COD & SePay integration
9. **ar** - AR snapshots

### Folder Structure

```
features/[domain]/
├── components/       # UI components
├── hooks/           # React hooks (useProducts, useOrders, etc)
├── services/        # API services (productsApi, ordersApi, etc)
└── types/           # Domain-specific types

types/              # Global type definitions
├── auth.types.ts
├── user.types.ts
├── address.types.ts
├── product.types.ts
├── category.types.ts
├── cart.types.ts
├── order.types.ts
├── payment.types.ts
├── ar.types.ts
├── common.types.ts
└── index.ts

stores/             # Zustand stores (auth.store, cart.store)
lib/                # Utilities
├── api-client.ts    # Axios instance + interceptors
└── utils.ts
```

## API Integration

### API Client

- **Location**: `lib/api-client.ts`
- **Base URL**: `http://localhost:3000`
- **HTTP Client**: Axios
- **Auth**: JWT (accessToken + refreshToken)
- **Token Refresh**: Automatic on 401 with retry

### Service Layer Pattern

```typescript
// features/[domain]/services/[domain].service.ts
export const [domain]Api = {
  async getAll(...): Promise<T[]> { ... },
  async getById(id: string): Promise<T> { ... },
  async create(data: Omit<T, "id">): Promise<T> { ... },
};
```

### Import Pattern

```typescript
// ✅ Correct
import { productsApi } from "@/features/products/services/products.service";
import type { Product } from "@/types";

// ❌ Avoid
import { productsApi } from "@/lib/api-client"; // Don't put services here
```

### Error Handling

```typescript
import { getErrorMessage } from "@/lib/api-client";

try {
  const data = await productsApi.getAll();
  setData(data);
} catch (error) {
  const message = getErrorMessage(error);
  setError(message);
  toast.error(message);
}
```

### User ID Handling - Decode JWT Token

**IMPORTANT**: Các API request cần `userId` phải lấy từ decoded JWT token trong auth store.

**Pattern:**

```typescript
// features/[domain]/services/[domain].service.ts
import { useAuthStore } from "@/stores/auth.store";

export const [domain]Api = {
  async getByUserId(): Promise<T> {
    // Lấy userId từ token decoded (stored in auth.store)
    const userId = useAuthStore.getState().getUserId();

    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }

    return apiGet<T>("/endpoint", { params: { userId } });
  },

  async create(data: CreateRequest): Promise<T> {
    // Một số API cần include userId trong body
    const userId = useAuthStore.getState().getUserId();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    return apiPost<T>("/endpoint", {
      ...data,
      userId, // Include userId nếu backend yêu cầu
    });
  },
};
```

**Quy trình JWT Decoding:**

1. Khi login → accessToken được lưu vào auth store
2. `auth.store.ts` tự động decode JWT payload
3. Extract `sub` (subject) claim → lưu thành `userId` state
4. Service layer gọi `getUserId()` để lấy userId
5. Gửi userId trong query params hoặc request body

**Ví dụ thực tế:**

```typescript
// orders.service.ts
import { useAuthStore } from "@/stores/auth.store";

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) throw new Error("User not authenticated");
    return apiGet<Order[]>("/orders", { params: { userId } });
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) throw new Error("User not authenticated");

    return apiPost<Order>("/orders", {
      userId,
      ...data,
    });
  },
};
```

**Khi nào cần userId:**

- ✅ `/orders` - GET danh sách đơn hàng của user
- ✅ `/addresses` - GET danh sách địa chỉ của user
- ✅ `/user-profile` - GET thông tin profile của user
- ❌ `/products` - GET danh sách sản phẩm (public)
- ❌ `/categories` - GET danh sách category (public)

## Type Definitions

### Global Types (types/)

- Import from `@/types` for global types
- Each domain has dedicated type file
- Export all from `types/index.ts`

### Common Types (types/common.types.ts)

```typescript
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## API Data Format

### Prices

- **Format**: Integer cents (e.g., 199900 = 1,999.00 VND)
- **Storage**: Always in cents
- **Display**: Divide by 100, format with currency locale

```typescript
const price = 199900; // cents
const display = (price / 100).toLocaleString("vi-VN"); // "1,999"
```

### Payments

- **Methods**: COD (Cash on Delivery), SEPAY (QR code) only
- **No**: Credit cards, Momo, ZaloPay
- **Status**: pending, completed, cancelled, failed

### Orders

- **Status**: pending, confirmed, shipped, delivered, cancelled
- **Address**: Required from user's saved addresses

## React Best Practices

### Component Patterns

1. **Client Component** - For state/effects/interactions

   ```typescript
   "use client";
   ```

2. **Server Component** - For server-only operations
   ```typescript
   // No "use client" - default Server Component
   ```

### Custom Hooks

```typescript
// hooks/use-[domain].ts
import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";

export function use[Domain]() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await [domain]Api.getAll();
        setData(result);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
}
```

## Documentation & Reference

### Key Files

- **Planning**: `docs/ai/planning/feature-api-integration.md`
- **Design**: `docs/ai/design/feature-api-integration.md`
- **Implementation**: `docs/ai/implementation/feature-api-integration.md`
- **Testing**: `docs/ai/testing/feature-api-integration.md`
- **Code Style**: `docs/ai/CODE_STYLE.md`

### Project Structure

- **AI Docs**: `docs/ai/` - Requirements, design, planning, implementation, testing
- **DevKit**: `AGENTS.md` - AI DevKit rules and workflow

## Common Commands & Workflows

### Task Execution

- Review current phase doc before implementing
- Update docs when requirements/design changes
- Reference planning doc for task breakdown

### Testing

- Use `/writing-test` for unit/integration tests
- Target 100% coverage for critical paths
- Test both success and error cases

### Git Workflow

- Feature branch: `feature/api-integration`
- Commit message format: `task([phase].[task]): Description`
- Example: `task(1.2): Populate type definitions`

## Important Notes

⚠️ **Do NOT:**

- Put service functions in `lib/api-client.ts` - Use service files instead
- Use hardcoded URLs - Use `apiGet()`, `apiPost()` helpers
- Mix mock data with real API - All mocks removed
- Manually manage auth tokens - Interceptor handles it
- Use .then() for sequential operations - Use async/await
- Hardcode userId - ALWAYS decode từ JWT token
- Call API cần userId mà không validate userId exists

✅ **Always:**

- Use TypeScript types for all API responses
- Handle errors with `getErrorMessage()`
- Extract async logic to custom hooks
- Import from correct domains
- Keep services and hooks separate
- Test error scenarios
- Decode userId từ JWT token khi cần trong service layer
- Check userId exists trước khi gửi API request
- Validate userId not null/undefined
- Using pnpm instead npm
- Using Shadcn MCP môi khi làm các tác vụ liên quan đến UI

## Session Notes

**Established**: 2025-11-01
**Updated**: 2025-11-01
**Status**: Active - Phase 1 Tasks (Foundation)
