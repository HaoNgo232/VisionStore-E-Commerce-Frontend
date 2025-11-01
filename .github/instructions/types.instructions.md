---
applyTo: "types/*.types.ts"
---

# Type Definitions Instructions

## Purpose

Type files contain TypeScript interfaces for each domain, ensuring type safety across the application.

## File Organization

Each domain has a dedicated type file:

- `auth.types.ts` - Authentication types
- `user.types.ts` - User profile types
- `address.types.ts` - Address types
- `product.types.ts` - Product types
- `category.types.ts` - Category types
- `cart.types.ts` - Cart types
- `order.types.ts` - Order types
- `payment.types.ts` - Payment types
- `ar.types.ts` - AR snapshot types
- `common.types.ts` - Shared/common types

All types must be exported from `types/index.ts`.

## Common Types Pattern

```typescript
// types/common.types.ts

/**
 * Standard API error response from backend
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API success response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

## Domain Type Pattern

```typescript
// types/product.types.ts

/**
 * Product entity
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // cents format (199900 = 1,999.00 VND)
  originalPrice?: number; // Sale price
  images: string[]; // Image URLs
  category: ProductCategory;
  brand: string;
  frameType: FrameType;
  material: string;
  color: string;
  inStock: boolean;
  rating: number; // 0-5
  reviewCount: number;
  features: string[];
}

/**
 * Filter criteria for product search
 */
export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  priceRange?: [number, number];
  frameType?: FrameType;
  color?: string;
  inStock?: boolean;
}

/**
 * Enumeration for product categories
 */
export type ProductCategory = "sunglasses" | "eyeglasses" | "sports" | "kids";

export type FrameType =
  | "full-rim"
  | "semi-rimless"
  | "rimless"
  | "aviator"
  | "wayfarer"
  | "round"
  | "cat-eye";
```

## Requirements

1. **Always include JSDoc comments**:

   ```typescript
   /**
    * Product entity with pricing in cents
    */
   export interface Product { ... }
   ```

2. **Use `interface` for objects**, `type` for unions:

   ```typescript
   // ✅ Object types
   export interface Product {}
   export interface Order {}

   // ✅ Union/enum types
   export type OrderStatus = "pending" | "confirmed" | "shipped";
   export type FrameType = "full-rim" | "semi-rimless";
   ```

3. **Prices always in cents**:

   ```typescript
   export interface Product {
     price: number; // cents (199900 = 1,999.00 VND)
   }
   ```

4. **Optional fields with `?`**:

   ```typescript
   export interface Product {
     id: string;
     name: string;
     description?: string; // Optional
     originalPrice?: number; // Only for sale items
   }
   ```

5. **Use `Omit<T, 'id'>` for create inputs**:

   ```typescript
   // Service method signature
   async create(data: Omit<Product, "id">): Promise<Product>

   // This ensures id is never provided on creation
   ```

6. **Group related types together**:
   ```typescript
   // ✅ Good organization
   // Main entity first
   export interface Product { }
   // Related filters
   export interface ProductFilters { }
   // Enums/unions
   export type ProductCategory = ...
   export type FrameType = ...
   ```

## Payment Types Example

```typescript
// types/payment.types.ts

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod; // "COD" | "SEPAY"
  amount: number; // cents
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "COD" | "SEPAY";
export type PaymentStatus = "pending" | "completed" | "cancelled" | "failed";

export interface CODPaymentRequest {
  orderId: string;
  amount: number; // cents
}

export interface SepayPaymentRequest {
  orderId: string;
  amount: number; // cents
  accountNo: string; // Bank account for transfer
}

export interface SepayQRResponse {
  qrCode: string;
  bankName: string;
  accountName: string;
  amount: string;
}
```

## Order Types Example

```typescript
// types/order.types.ts

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  total: number; // cents
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product: Product; // Include product details
  quantity: number;
  price: number; // cents at time of purchase
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
```

## Auth Types Example

```typescript
// types/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}
```

## Exporting from index.ts

```typescript
// types/index.ts

// Auth domain
export type { LoginRequest, RegisterRequest, AuthResponse } from "./auth.types";

// Products domain
export type {
  Product,
  ProductFilters,
  ProductCategory,
  FrameType,
} from "./product.types";

// Orders domain
export type { Order, OrderItem, OrderStatus } from "./order.types";

// Payments domain
export type { Payment, PaymentMethod, PaymentStatus } from "./payment.types";

// Common types
export type { ApiError, PaginatedResponse, ApiResponse } from "./common.types";
```

## Do's & Don'ts

✅ **Do:**

- Document interfaces with JSDoc
- Use specific types (not `any`)
- Import/export all types through index.ts
- Keep types close to their usage
- Use interfaces for objects, types for unions
- Include default/optional fields appropriately

❌ **Don't:**

- Use `any` type - Always type explicitly
- Mix concerns in one type file
- Create circular dependencies
- Use `interface` for unions/enums - Use `type`
- Make everything optional - Only when truly optional
- Export unrelated types together
