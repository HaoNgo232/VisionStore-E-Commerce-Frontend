---
applyTo: "**/*.ts,**/*.tsx,**/types/**/*.ts"
---

# Type Safety Instructions

## **Never Use `any` - Alternatives**

```typescript
// ❌ WRONG - Never do this
function processData(data: any): any {
  return data.someProperty;
}

// ✅ CORRECT - Use proper typing
interface DataInput {
  someProperty: string;
  otherProperty: number;
}

function processData(data: DataInput): ProcessedData {
  return {
    processedValue: data.someProperty.toUpperCase(),
  };
}

// ✅ CORRECT - Use unknown for truly unknown data
function handleUnknownData(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }
  if (typeof data === "object" && data !== null && "toString" in data) {
    return String(data);
  }
  return "Unknown data";
}
```

## **Backend Type Synchronization**

```typescript
// Backend reference: @shared/types/product.types.ts
import { cuidSchema } from "./common.types";

interface Product {
  id: string; // CUID from backend (not UUID)
  name: string; // Required field
  priceInt: number; // Price in cents (match backend exactly)
  categoryId: string; // Foreign key (CUID)
  imageUrls: string[]; // Array of URLs
  isActive: boolean; // Soft delete flag
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Zod schema for runtime validation
export const ProductSchema = z.object({
  id: cuidSchema(), // Backend uses CUID, not UUID
  name: z.string().min(1),
  priceInt: z.number().int().positive(),
  categoryId: cuidSchema(), // Backend uses CUID, not UUID
  imageUrls: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Type inference from schema
export type Product = z.infer<typeof ProductSchema>;
```

## **Type Guards & Validation**

```typescript
// Type guard functions
export function isProduct(obj: unknown): obj is Product {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).name === "string"
  );
}

// API response validation
export function validateApiResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`API validation failed: ${error.message}`);
    }
    throw error;
  }
}
```

## **Default Parameters Best Practices**

### **❌ TRÁNH: Default Parameter với Object Literal**

Default parameter với object literal `= {}` gây ra TypeScript strict mode false positives:

```typescript
// ❌ WRONG - Gây false positives với TypeScript strict mode
async function listUsers(
  query: ListUsersQuery = {},
): Promise<ListUsersResponse> {
  // TypeScript không thể infer type đúng, gây unsafe member access errors
  if (query.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
}
```

### **✅ ĐÚNG: Optional Parameter + Optional Chaining**

```typescript
// ✅ CORRECT - Type-safe, không có false positives
async function listUsers(query?: ListUsersQuery): Promise<ListUsersResponse> {
  const searchParams = new URLSearchParams();

  if (query?.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
  if (query?.pageSize !== undefined) {
    searchParams.set("pageSize", query.pageSize.toString());
  }
  if (query?.search) {
    searchParams.set("search", query.search);
  }
  if (query?.role) {
    searchParams.set("role", query.role);
  }
}
```

### **✅ ĐÚNG: Local Interface (Nếu cần)**

```typescript
// ✅ CORRECT - Local interface cho better type inference
interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}

async function listUsers(query?: ListUsersParams): Promise<ListUsersResponse> {
  if (query?.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
}
```

## **Error Handling Types**

```typescript
// Result pattern for error handling
type Result<T, E = Error> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };

// API Error types
interface ApiError {
  statusCode: number;
  message: string;
  details?: unknown;
}

// Usage in API calls
async function fetchProduct(id: string): Promise<Result<Product, ApiError>> {
  try {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();
    const product = validateApiResponse(data, ProductSchema);
    return { success: true, data: product, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
```
