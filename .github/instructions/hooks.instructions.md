---
applyTo: "features/*/hooks/*.ts,hooks/*.ts"
---

# Custom Hooks Instructions

## Purpose
Hooks encapsulate API call logic and state management, making components cleaner and reusable.

## Pattern

```typescript
"use client";

import { useState, useEffect } from "react";
import type { [Type], [TypeFilters] } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { [domain]Api } from "@/features/[domain]/services/[domain].service";

export function use[Domain](filters?: [TypeFilters]) {
  const [data, setData] = useState<[Type][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await [domain]Api.getAll(filters);
        setData(result);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [filters]); // Include all dependencies

  return { data, loading, error };
}
```

## Requirements

1. **Always mark as client component**:
   ```typescript
   "use client"; // Required for useState, useEffect
   ```

2. **Use async/await in useEffect**:
   ```typescript
   useEffect(() => {
     const fetch = async () => {
       const data = await apiCall();
       setData(data);
     };
     fetch();
   }, [dependencies]);
   ```

3. **Handle all three states**:
   - `loading` - Initial fetch or refetching
   - `error` - Error message from getErrorMessage()
   - `data` - Actual data from API

4. **Include dependencies in useEffect**:
   ```typescript
   useEffect(() => { ... }, [filters]); // ✅ Include filters
   useEffect(() => { ... }, []); // ❌ Missing dependencies
   ```

5. **Return consistent object**:
   ```typescript
   return { data, loading, error };
   // or with additional methods
   return { data, loading, error, refetch, updateFilters };
   ```

6. **Use getErrorMessage() for errors**:
   ```typescript
   import { getErrorMessage } from "@/lib/api-client";
   
   try { ... }
   catch (err) {
     setError(getErrorMessage(err)); // Transforms error to user-friendly message
   }
   ```

## Examples

### Simple List Hook
```typescript
// hooks/use-products.ts
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getAll(filters);
        setProducts(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [filters]);

  return { products, loading, error };
}
```

### Single Item Hook
```typescript
// hooks/use-product-detail.ts
export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getById(productId);
        setProduct(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [productId]);

  return { product, loading, error };
}
```

### Hook with Additional Methods
```typescript
// hooks/use-addresses.ts
export function useAddresses(userId: string) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressesApi.getAll(userId);
      setAddresses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const addAddress = async (address: Omit<Address, "id">) => {
    try {
      const created = await addressesApi.create(address);
      setAddresses([...addresses, created]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressesApi.delete(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  return { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    deleteAddress, 
    refetch: fetchAddresses 
  };
}
```

## Usage in Components

✅ **Correct:**
```typescript
export function ProductsList() {
  const { products, loading, error } = useProducts();

  if (loading) return <Skeleton />;
  if (error) return <Error message={error} />;
  return <Grid items={products} />;
}
```

❌ **Avoid:**
```typescript
// Don't call API directly in component
export function ProductsList() {
  useEffect(() => {
    fetch("/api/products").then(...); // ❌ No abstraction
  }, []);
}
```

## Naming Conventions

- Hook name: `use[Domain]()` - e.g., `useProducts()`, `useOrders()`
- Singular for detail: `useProductDetail()`, not `useProduct()`
- State names: `data`, `loading`, `error`
- Method names: `refetch()`, `add[Item]()`, `delete[Item]()`

## Do's & Don'ts

✅ **Do:**
- Use async/await (not .then())
- Include useEffect dependencies
- Handle all three states (loading, error, data)
- Reuse across components
- Add JSDoc if complex logic
- Extract refetch as separate function if needed

❌ **Don't:**
- Add UI logic (toast, redirects) - Keep pure
- Call multiple APIs - One hook per domain
- Forget "use client" directive
- Skip error handling
- Ignore dependency arrays
- Use try-catch without error state update
