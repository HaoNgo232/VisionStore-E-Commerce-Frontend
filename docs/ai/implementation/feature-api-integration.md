---
phase: implementation
title: Implementation Guide - API Integration
description: Chi tiết kỹ thuật, patterns và code guidelines cho API integration
---

# Implementation Guide - API Integration

## Development Setup

### Prerequisites

```bash
# Required
- Node.js >= 20
- pnpm >= 10
- Backend services running on localhost:3000

# Check backend health
curl http://localhost:3000/health
```

### Installation Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Add new dependencies
pnpm add axios
pnpm add -D @types/axios

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development Commands

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:watch
```

---

## Code Structure

### Directory Layout

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth group routes
│   ├── (shop)/                  # Shop group routes
│   └── api/                     # API routes (if needed)
│
├── types/                        # TypeScript type definitions
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── address.types.ts
│   ├── product.types.ts
│   ├── category.types.ts
│   ├── cart.types.ts
│   ├── order.types.ts
│   ├── payment.types.ts
│   ├── ar.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── services/                     # API service layer
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── users/
│   ├── addresses/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   └── ar/
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   └── hooks/
│   ├── users/
│   ├── addresses/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   └── ar/
│
├── stores/                       # Zustand global state
│   ├── auth.store.ts
│   ├── cart.store.ts
│   ├── user.store.ts
│   └── index.ts
│
├── lib/                          # Utilities & config
│   ├── api-client.ts            # Axios instance + interceptors
│   ├── api-config.ts            # API configuration
│   ├── auth-utils.ts            # Token decode, validation
│   └── utils.ts                 # General utilities
│
└── components/                   # Shared UI components
    ├── ui/                      # shadcn/ui components
    └── ...
```

### Naming Conventions

**Files:**

- Components: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Hooks: `use-*.ts` (e.g., `use-auth.ts`)
- Types: `*.types.ts` (e.g., `auth.types.ts`)
- Stores: `*.store.ts` (e.g., `auth.store.ts`)

**Code:**

- React components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Enums: `PascalCase`

---

## Implementation Notes

### Core Features

#### 1. API Client (`lib/api-client.ts`)

```typescript
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "./api-config";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiError } from "@/types/common.types";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Token expired - try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper để transform errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || "An error occurred";
  }
  return "An unexpected error occurred";
}
```

#### 2. Auth Store (`stores/auth.store.ts`)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      // Chỉ persist refreshToken, không persist accessToken
      partialize: (state) => ({
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
```

#### 3. Service Pattern

```typescript
// services/auth/auth.service.ts
import { apiClient } from "@/lib/api-client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyResponse,
} from "@/types/auth.types";
import type { UserResponse } from "@/types/user.types";

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Verify token validity
   */
  async verify(token: string): Promise<VerifyResponse> {
    const response = await apiClient.post<VerifyResponse>("/auth/verify", {
      token,
    });
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>("/auth/me");
    return response.data;
  },
};
```

#### 4. Hook Pattern

```typescript
// features/auth/hooks/use-auth.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/lib/api-client";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setTokens, clearAuth } = useAuthStore();

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(data);
      setTokens(response.accessToken, response.refreshToken);

      // Redirect to home
      router.push("/home");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(data);
      setTokens(response.accessToken, response.refreshToken);

      // Redirect to home
      router.push("/home");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/");
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
  };
}
```

#### 5. Type Definitions

```typescript
// types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  role?: string;
}

export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: "CUSTOMER" | "ADMIN";
  iat?: number;
  exp?: number;
}
```

---

### Patterns & Best Practices

#### 1. Error Handling Pattern

```typescript
// In hooks
try {
  setLoading(true);
  setError(null);

  const data = await service.method();
  // Handle success
} catch (err) {
  const message = getErrorMessage(err);
  setError(message);

  // Optional: Toast notification
  toast.error(message);

  // Re-throw if needed
  throw err;
} finally {
  setLoading(false);
}
```

#### 2. Price Formatting

```typescript
// lib/utils.ts
/**
 * Format price from cents to VND display
 * @param priceInt - Price in cents (e.g., 199900)
 * @returns Formatted string (e.g., "1,999,00 VND")
 */
export function formatPrice(priceInt: number): string {
  const price = priceInt / 100;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Usage in component
<p>{formatPrice(product.priceInt)}</p>;
```

#### 3. Protected Route Pattern

```typescript
// components/auth/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or loading spinner
  }

  return <>{children}</>;
}

// Usage in page
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
```

#### 4. Pagination Pattern

```typescript
// features/products/hooks/use-products.ts
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        page: pageNum,
        pageSize: 20,
      });

      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return {
    products,
    loading,
    page,
    totalPages,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => p - 1),
    goToPage: setPage,
  };
}
```

#### 5. Optimistic Updates (Cart)

```typescript
// stores/cart.store.ts
addItem: async (productId: string, quantity: number) => {
  const { cart } = get();

  // Optimistic update
  const optimisticCart = [...cart, { productId, quantity }];
  set({ cart: optimisticCart });

  try {
    // API call
    const response = await cartService.addItem({ productId, quantity });

    // Update with real data
    set({ cart: response.items });
  } catch (err) {
    // Rollback on error
    set({ cart });
    throw err;
  }
};
```

---

## Integration Points

### API Gateway

- **URL**: `http://localhost:3000` (development)
- **Production**: TBD
- **Authentication**: Bearer Token trong header
- **Content-Type**: `application/json`

### Authentication Flow

1. User login → get tokens
2. Store tokens (access in memory, refresh in localStorage)
3. Add access token to all requests
4. On 401 → refresh token → retry
5. If refresh fails → logout

### Payment Integration

#### COD (Cash on Delivery)

```typescript
const payment = await paymentsService.processPayment({
  orderId: order.id,
  method: "COD",
  amountInt: order.totalInt,
});

// Payment status: UNPAID
// Complete when shipper confirms delivery
```

#### SePay (QR Code)

```typescript
const payment = await paymentsService.processPayment({
  orderId: order.id,
  method: "SEPAY",
  amountInt: order.totalInt,
});

// Display QR code: payment.qrCode
// Poll payment status or wait for webhook
```

---

## Error Handling

### Error Types

```typescript
// types/common.types.ts
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}
```

### Error Handler Utility

```typescript
// lib/error-handler.ts
import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleApiError(error: unknown, showToast = true) {
  let message = "An unexpected error occurred";

  if (error instanceof AxiosError) {
    message = error.response?.data?.message || error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  if (showToast) {
    toast.error(message);
  }

  console.error("[API Error]", error);
  return message;
}
```

### Retry Logic

```typescript
// lib/api-client.ts
import axiosRetry from "axios-retry";

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ?? 0) >= 500
    );
  },
});
```

---

## Performance Considerations

### 1. Code Splitting

```typescript
// Lazy load heavy components
const ARViewer = dynamic(() => import("./ar-viewer"), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from "next/image";

<Image
  src={product.imageUrls[0]}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"
/>;
```

### 3. Debouncing Search

```typescript
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback((value: string) => {
  searchProducts(value);
}, 300);
```

### 4. Request Deduplication

```typescript
// Simple cache for GET requests
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string, ttl = 60000): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  return null;
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// services/auth/auth.service.test.ts
import { describe, it, expect, vi } from "vitest";
import { authService } from "./auth.service";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client");

describe("authService", () => {
  it("should login successfully", async () => {
    const mockResponse = {
      data: {
        accessToken: "token123",
        refreshToken: "refresh123",
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual(mockResponse.data);
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@example.com",
      password: "password123",
    });
  });
});
```

### Integration Tests

```typescript
// features/auth/hooks/use-auth.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./use-auth";

describe("useAuth", () => {
  it("should handle login flow", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
```

---

## Common Utilities

### Token Utilities

```typescript
// lib/auth-utils.ts
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@/types/auth.types";

export function decodeToken(token: string): TokenPayload {
  return jwtDecode<TokenPayload>(token);
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function getTokenExpiryTime(token: string): number {
  const decoded = decodeToken(token);
  return decoded.exp ? decoded.exp * 1000 : 0;
}
```

### Format Utilities

```typescript
// lib/format-utils.ts

export function formatPrice(priceInt: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(priceInt / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status;
}
```

---

## Troubleshooting

### Common Issues

**Issue: CORS errors**

```bash
# Backend phải enable CORS cho frontend origin
# Check backend gateway CORS config
```

**Issue: Token not persisting**

```typescript
// Check Zustand persist config
// Verify localStorage not blocked
```

**Issue: 401 errors despite valid token**

```typescript
// Check token format: "Bearer <token>"
// Verify token not expired
// Check backend JWT secret match
```

**Issue: Type errors**

```bash
# Regenerate types from backend
# Sync với backend @shared/types
```

---

## Next Steps After Implementation

1. **Code Review**: Run `/code-review` với file list
2. **Testing**: Write unit + integration tests
3. **Documentation**: Update README với setup instructions
4. **Performance**: Profile và optimize bottlenecks
5. **Security**: Review auth flow, XSS prevention
6. **Deployment**: Setup production environment
