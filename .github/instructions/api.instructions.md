---
applyTo: "**/services/**/*.ts,**/api/**/*.ts,**/hooks/use-*.ts"
---

# API Integration & Type Safety

## **Type-Safe API Service Pattern**

```typescript
// Base API service với proper error handling
interface ApiResponse<T> {
  data: T
  statusCode: number
  message?: string
}

class BaseApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.status}`,
          response.status
        )
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Network error', 500)
    }
  }

  protected get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  protected post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'ApiError'
  }
}
```

## **Feature-Specific API Services**

```typescript
// products.service.ts
export class ProductsApiService extends BaseApiService {
  async getProducts(query: ProductListQuery): Promise<PaginatedProductsResponse> {
    const searchParams = new URLSearchParams()
    
    // Type-safe query building
    if (query.page !== undefined) {
      searchParams.set('page', query.page.toString())
    }
    if (query.search) {
      searchParams.set('search', query.search)
    }
    
    const endpoint = `/products${searchParams.toString() ? `?${searchParams}` : ''}`
    const response = await this.get<PaginatedProductsResponse>(endpoint)
    
    // Validate response với Zod
    return PaginatedProductsResponseSchema.parse(response)
  }

  async getProductById(id: string): Promise<Product> {
    if (!id) throw new Error('Product ID is required')
    
    const response = await this.get<Product>(`/products/${encodeURIComponent(id)}`)
    return ProductSchema.parse(response)
  }
}

export const productsApi = new ProductsApiService()
```

## **React Query Integration**

```typescript
// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (query: ProductListQuery) => [...productKeys.lists(), query] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// Typed hooks
export function useProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productsApi.getProducts(query),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: Boolean(id),
  })
}
```

