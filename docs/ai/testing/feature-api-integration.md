---
phase: testing
title: Testing Strategy - API Integration
description: Chi tiết test cases, coverage goals và testing approach
---

# Testing Strategy - API Integration

## Testing Overview

### Goals

- ✅ Ensure API integration hoạt động đúng
- ✅ Prevent regressions khi refactor
- ✅ Validate error handling
- ✅ Achieve >80% coverage cho critical paths

### Testing Pyramid

```
       /\
      /  \    E2E Tests (10%)
     /____\   Critical user journeys
    /      \
   / Integ  \ Integration Tests (30%)
  /  Tests  \ Feature workflows
 /__________\
/            \
/  Unit Tests \ Unit Tests (60%)
/______________\ Services, hooks, utils
```

---

## Test Coverage Goals

### Critical Paths (100% Coverage)

- ✅ Authentication flow (login, register, token refresh)
- ✅ Checkout flow (cart → order → payment)
- ✅ Protected routes authorization

### Important Features (80% Coverage)

- Products listing và filtering
- Cart operations (add, update, remove)
- Order management
- Address management

### Nice-to-Have (50% Coverage)

- AR snapshots
- Admin features
- Profile updates

---

## Unit Tests

### 1. Services Tests

#### Auth Service

```typescript
// services/auth/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth.service";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client");

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        data: {
          accessToken: "access-token-123",
          refreshToken: "refresh-token-456",
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

    it("should throw error on invalid credentials", async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: "Invalid credentials",
          },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(
        authService.login({
          email: "wrong@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const mockResponse = {
        data: {
          accessToken: "new-token",
          refreshToken: "new-refresh",
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.register({
        email: "new@example.com",
        password: "password123",
        fullName: "New User",
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error on duplicate email", async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: "Email already exists",
          },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(
        authService.register({
          email: "existing@example.com",
          password: "password123",
          fullName: "User",
        }),
      ).rejects.toThrow();
    });
  });

  describe("refresh", () => {
    it("should refresh token successfully", async () => {
      const mockResponse = {
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.refresh("old-refresh-token");

      expect(result).toEqual(mockResponse.data);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-refresh-token",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user data", async () => {
      const mockUser = {
        data: {
          id: "user-123",
          email: "test@example.com",
          fullName: "Test User",
          role: "CUSTOMER",
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser.data);
      expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
    });
  });
});
```

#### Products Service

```typescript
// services/products/products.service.test.ts
import { describe, it, expect, vi } from "vitest";
import { productsService } from "./products.service";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client");

describe("productsService", () => {
  describe("getProducts", () => {
    it("should fetch products with pagination", async () => {
      const mockResponse = {
        data: {
          products: [
            { id: "1", name: "Product 1", priceInt: 100000 },
            { id: "2", name: "Product 2", priceInt: 200000 },
          ],
          total: 50,
          page: 1,
          pageSize: 20,
          totalPages: 3,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      const result = await productsService.getProducts({
        page: 1,
        pageSize: 20,
      });

      expect(result).toEqual(mockResponse.data);
      expect(apiClient.get).toHaveBeenCalledWith("/products", {
        params: { page: 1, pageSize: 20 },
      });
    });

    it("should filter products by category", async () => {
      const mockResponse = {
        data: {
          products: [],
          total: 0,
          page: 1,
          pageSize: 20,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      await productsService.getProducts({
        categorySlug: "furniture",
      });

      expect(apiClient.get).toHaveBeenCalledWith("/products", {
        params: { categorySlug: "furniture" },
      });
    });
  });
});
```

#### Cart Service

```typescript
// services/cart/cart.service.test.ts
describe("cartService", () => {
  it("should add item to cart", async () => {
    const mockResponse = {
      data: {
        cartItem: {
          id: "item-123",
          productId: "prod-456",
          quantity: 2,
        },
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    const result = await cartService.addItem({
      userId: "user-123",
      productId: "prod-456",
      quantity: 2,
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should throw error when product out of stock", async () => {
    const mockError = {
      response: {
        status: 400,
        data: {
          message: "Product out of stock",
        },
      },
    };

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    await expect(
      cartService.addItem({
        userId: "user-123",
        productId: "out-of-stock",
        quantity: 1,
      }),
    ).rejects.toThrow();
  });
});
```

### 2. Hooks Tests

```typescript
// features/auth/hooks/use-auth.test.tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAuth } from "./use-auth";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("@/services/auth");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("useAuth", () => {
  it("should handle successful login", async () => {
    const mockTokens = {
      accessToken: "token",
      refreshToken: "refresh",
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockTokens);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(authService.login).toHaveBeenCalled();
  });

  it("should handle login error", async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(
      new Error("Invalid credentials"),
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({
          email: "wrong@example.com",
          password: "wrong",
        });
      } catch (err) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("should handle logout", () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    // Should clear auth store
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
```

### 3. Utility Tests

```typescript
// lib/auth-utils.test.ts
import { describe, it, expect } from "vitest";
import { decodeToken, isTokenExpired } from "./auth-utils";

describe("auth-utils", () => {
  describe("decodeToken", () => {
    it("should decode valid JWT token", () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxNjMwMDAwOTAwfQ.fake";

      const decoded = decodeToken(token);

      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
    });
  });

  describe("isTokenExpired", () => {
    it("should return true for expired token", () => {
      const expiredToken = createExpiredToken();
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it("should return false for valid token", () => {
      const validToken = createValidToken();
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
});

// lib/format-utils.test.ts
describe("formatPrice", () => {
  it("should format cents to VND", () => {
    expect(formatPrice(199900)).toBe("1.999,00 ₫");
    expect(formatPrice(1000000)).toBe("10.000,00 ₫");
  });
});
```

---

## Integration Tests

### 1. Auth Flow

```typescript
// __tests__/integration/auth-flow.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import LoginPage from "@/app/(auth)/login/page";

describe("Authentication Flow", () => {
  it("should complete full login flow", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    // Fill form
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Submit
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Wait for redirect
    await waitFor(() => {
      expect(window.location.pathname).toBe("/home");
    });
  });

  it("should show error on invalid credentials", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");

    await user.click(screen.getByRole("button", { name: /login/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Checkout Flow

```typescript
// __tests__/integration/checkout-flow.test.tsx
describe("Checkout Flow", () => {
  it("should complete full checkout from cart to order", async () => {
    // 1. Add product to cart
    // 2. Go to cart page
    // 3. Proceed to checkout
    // 4. Select address
    // 5. Select payment method
    // 6. Create order
    // 7. Verify order created

    const user = userEvent.setup();

    // Login first
    await loginTestUser();

    // Add to cart
    render(<ProductPage productId="test-product" />);
    await user.click(screen.getByText(/add to cart/i));

    // Go to cart
    await user.click(screen.getByText(/view cart/i));

    // Proceed to checkout
    await user.click(screen.getByText(/checkout/i));

    // Select address
    await user.click(screen.getByText(/select address/i));

    // Select payment (COD)
    await user.click(screen.getByLabelText(/cash on delivery/i));

    // Place order
    await user.click(screen.getByText(/place order/i));

    // Verify success
    await waitFor(() => {
      expect(
        screen.getByText(/order placed successfully/i),
      ).toBeInTheDocument();
    });
  });
});
```

### 3. Protected Routes

```typescript
// __tests__/integration/protected-routes.test.tsx
describe("Protected Routes", () => {
  it("should redirect to login when accessing protected route unauthenticated", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });

  it("should allow access when authenticated", async () => {
    // Setup authenticated state
    useAuthStore.getState().setTokens("token", "refresh");

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Tests (Playwright)

### Critical User Journeys

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should login and access protected page", async ({ page }) => {
    // Go to login
    await page.goto("/login");

    // Fill credentials
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");

    // Submit
    await page.click('button:has-text("Login")');

    // Should redirect to home
    await expect(page).toHaveURL("/home");

    // Should show user info
    await expect(page.locator("text=test@example.com")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await loginHelper(page, "test@example.com", "password123");

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await expect(page).toHaveURL("/");

    // Should not show user info
    await expect(page.locator("text=Login")).toBeVisible();
  });
});

// e2e/checkout.spec.ts
test.describe("Checkout Flow", () => {
  test("should complete checkout with COD payment", async ({ page }) => {
    // Login
    await loginHelper(page, "test@example.com", "password123");

    // Browse products
    await page.goto("/products");

    // Add to cart
    await page.click(
      '.product-card:first-child button:has-text("Add to Cart")',
    );

    // Go to cart
    await page.click('a:has-text("Cart")');

    // Checkout
    await page.click('button:has-text("Checkout")');

    // Select address
    await page.click(".address-card:first-child");

    // Select COD
    await page.click('input[value="COD"]');

    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify success
    await expect(page.locator("text=Order placed successfully")).toBeVisible();

    // Should show order number
    await expect(page.locator("text=/Order #\\d+/")).toBeVisible();
  });
});
```

---

## Test Data & Mocking

### Mock Data Setup

```typescript
// __tests__/fixtures/mock-data.ts
export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  fullName: "Test User",
  role: "CUSTOMER" as const,
};

export const mockProduct = {
  id: "prod-123",
  name: "Test Product",
  slug: "test-product",
  priceInt: 199900,
  stock: 10,
  imageUrls: ["https://example.com/image.jpg"],
};

export const mockCart = {
  cart: {
    id: "cart-123",
    sessionId: "session-123",
    userId: "user-123",
  },
  items: [
    {
      id: "item-123",
      productId: "prod-123",
      quantity: 2,
      product: mockProduct,
    },
  ],
  totalInt: 399800,
};
```

### MSW (Mock Service Worker)

```typescript
// __tests__/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  // Auth endpoints
  rest.post("/auth/login", (req, res, ctx) => {
    return res(
      ctx.json({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      }),
    );
  }),

  // Products endpoints
  rest.get("/products", (req, res, ctx) => {
    return res(
      ctx.json({
        products: [mockProduct],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    );
  }),

  // Cart endpoints
  rest.get("/cart", (req, res, ctx) => {
    return res(ctx.json(mockCart));
  }),
];

// __tests__/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

---

## Running Tests

### Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Specific test file
pnpm test auth.service.test.ts
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Coverage Report

### Current Status

- [ ] Auth Service: 0% → Target: 100%
- [ ] Products Service: 0% → Target: 80%
- [ ] Cart Service: 0% → Target: 90%
- [ ] Orders Service: 0% → Target: 80%
- [ ] Payments Service: 0% → Target: 90%
- [ ] Hooks: 0% → Target: 70%
- [ ] Utils: 0% → Target: 90%

### Gaps & TODO

- [ ] Write tests cho error scenarios
- [ ] Test token refresh flow
- [ ] Test optimistic updates trong cart
- [ ] Test payment webhooks
- [ ] E2E tests cho critical flows

---

## Manual Testing Checklist

### Authentication

- [ ] User có thể register với email mới
- [ ] User không thể register với email đã tồn tại
- [ ] User có thể login với credentials đúng
- [ ] User không thể login với credentials sai
- [ ] Token tự động refresh khi expired
- [ ] User tự động logout khi refresh token expired
- [ ] Protected routes redirect to login

### Products

- [ ] Products list hiển thị đúng
- [ ] Pagination hoạt động
- [ ] Search products hoạt động
- [ ] Filter by category hoạt động
- [ ] Product detail page load đúng
- [ ] Images hiển thị đúng
- [ ] Price format đúng (VND)

### Cart

- [ ] Add to cart hoạt động
- [ ] Update quantity hoạt động
- [ ] Remove from cart hoạt động
- [ ] Cart sync với server
- [ ] Guest cart merge khi login
- [ ] Stock validation khi add
- [ ] Total calculated đúng

### Checkout & Orders

- [ ] Checkout flow hoàn chỉnh
- [ ] Address selection hoạt động
- [ ] Order summary đúng
- [ ] COD payment hoạt động
- [ ] SePay QR code hiển thị
- [ ] Order created successfully
- [ ] Order list hiển thị
- [ ] Order detail page đúng
- [ ] Cancel order hoạt động

### Error Handling

- [ ] Network errors show message
- [ ] 401 errors trigger token refresh
- [ ] 404 errors show not found
- [ ] 500 errors show generic message
- [ ] Validation errors show field-specific messages

---

## Performance Testing

### Metrics to Track

- **API Response Times**

  - Login: < 500ms
  - Products list: < 500ms
  - Cart operations: < 300ms
  - Order creation: < 1s

- **UI Performance**
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3s
  - Largest Contentful Paint: < 2.5s

### Load Testing (Optional)

```bash
# Using k6
k6 run load-test.js

# Test scenarios
- 10 concurrent users browsing products
- 5 users completing checkout
- Measure response times under load
```

---

## Test Documentation

### Writing Good Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Clear test names**: `should [expected behavior] when [condition]`
4. **Isolate tests**: No dependencies between tests
5. **Mock external dependencies**: API calls, localStorage, etc.

### Test Naming Convention

```typescript
describe("ServiceName", () => {
  describe("methodName", () => {
    it("should do X when Y", () => {
      // test
    });

    it("should throw error when Z", () => {
      // test
    });
  });
});
```

---

## Next Steps

1. ✅ Implement services và hooks
2. ⏭️ Write unit tests cho services
3. ⏭️ Write integration tests cho critical flows
4. ⏭️ Setup CI/CD pipeline
5. ⏭️ Achieve coverage targets
6. ⏭️ E2E tests cho production deployment
