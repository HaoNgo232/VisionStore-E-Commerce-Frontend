// API client structure ready for backend integration
// Currently returns mock data, easy to replace with real API calls

import type { Product, ProductFilters, Order, Address, Cart } from "@/types"
import { mockProducts, mockOrders, mockAddresses } from "./mock-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Helper function for future API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // TODO: Replace with actual fetch call when backend is ready
  // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  //   ...options,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...options?.headers,
  //   },
  // });
  // if (!response.ok) throw new Error('API call failed');
  // return response.json();

  // For now, return mock data
  throw new Error("Not implemented - using mock data")
}

// Products API
export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<Product[]> => {
    // TODO: Replace with API call
    // return apiCall<Product[]>('/products', { method: 'GET' });

    let filtered = [...mockProducts]

    if (filters?.category) {
      filtered = filtered.filter((p) => p.category === filters.category)
    }
    if (filters?.brand) {
      filtered = filtered.filter((p) => p.brand === filters.brand)
    }
    if (filters?.frameType) {
      filtered = filtered.filter((p) => p.frameType === filters.frameType)
    }
    if (filters?.inStock !== undefined) {
      filtered = filtered.filter((p) => p.inStock === filters.inStock)
    }
    if (filters?.priceRange) {
      const [min, max] = filters.priceRange
      filtered = filtered.filter((p) => p.price >= min && p.price <= max)
    }

    return Promise.resolve(filtered)
  },

  getById: async (id: string): Promise<Product | null> => {
    // TODO: Replace with API call
    // return apiCall<Product>(`/products/${id}`, { method: 'GET' });

    const product = mockProducts.find((p) => p.id === id)
    return Promise.resolve(product || null)
  },

  getFeatured: async (): Promise<Product[]> => {
    // TODO: Replace with API call
    // return apiCall<Product[]>('/products/featured', { method: 'GET' });

    return Promise.resolve(mockProducts.slice(0, 4))
  },
}

// Orders API
export const ordersApi = {
  getAll: async (userId: string): Promise<Order[]> => {
    // TODO: Replace with API call
    // return apiCall<Order[]>(`/orders?userId=${userId}`, { method: 'GET' });

    return Promise.resolve(mockOrders.filter((o) => o.userId === userId))
  },

  getById: async (id: string): Promise<Order | null> => {
    // TODO: Replace with API call
    // return apiCall<Order>(`/orders/${id}`, { method: 'GET' });

    const order = mockOrders.find((o) => o.id === id)
    return Promise.resolve(order || null)
  },

  create: async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> => {
    // TODO: Replace with API call
    // return apiCall<Order>('/orders', {
    //   method: 'POST',
    //   body: JSON.stringify(orderData),
    // });

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return Promise.resolve(newOrder)
  },
}

// Addresses API
export const addressesApi = {
  getAll: async (userId: string): Promise<Address[]> => {
    // TODO: Replace with API call
    // return apiCall<Address[]>(`/addresses?userId=${userId}`, { method: 'GET' });

    return Promise.resolve(mockAddresses)
  },

  create: async (address: Omit<Address, "id">): Promise<Address> => {
    // TODO: Replace with API call
    // return apiCall<Address>('/addresses', {
    //   method: 'POST',
    //   body: JSON.stringify(address),
    // });

    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    }
    return Promise.resolve(newAddress)
  },

  update: async (id: string, address: Partial<Address>): Promise<Address> => {
    // TODO: Replace with API call
    // return apiCall<Address>(`/addresses/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(address),
    // });

    const existing = mockAddresses.find((a) => a.id === id)
    if (!existing) throw new Error("Address not found")

    const updated = { ...existing, ...address }
    return Promise.resolve(updated)
  },

  delete: async (id: string): Promise<void> => {
    // TODO: Replace with API call
    // return apiCall<void>(`/addresses/${id}`, { method: 'DELETE' });

    return Promise.resolve()
  },
}

// Cart API
export const cartApi = {
  get: async (userId: string): Promise<Cart> => {
    // TODO: Replace with API call
    // return apiCall<Cart>(`/cart?userId=${userId}`, { method: 'GET' });

    // Mock empty cart
    return Promise.resolve({
      items: [],
      total: 0,
      itemCount: 0,
    })
  },

  addItem: async (userId: string, productId: string, quantity: number): Promise<Cart> => {
    // TODO: Replace with API call
    // return apiCall<Cart>('/cart/items', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, productId, quantity }),
    // });

    return Promise.resolve({
      items: [],
      total: 0,
      itemCount: 0,
    })
  },

  updateItem: async (userId: string, productId: string, quantity: number): Promise<Cart> => {
    // TODO: Replace with API call
    // return apiCall<Cart>(`/cart/items/${productId}`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ userId, quantity }),
    // });

    return Promise.resolve({
      items: [],
      total: 0,
      itemCount: 0,
    })
  },

  removeItem: async (userId: string, productId: string): Promise<Cart> => {
    // TODO: Replace with API call
    // return apiCall<Cart>(`/cart/items/${productId}`, {
    //   method: 'DELETE',
    //   body: JSON.stringify({ userId }),
    // });

    return Promise.resolve({
      items: [],
      total: 0,
      itemCount: 0,
    })
  },
}
