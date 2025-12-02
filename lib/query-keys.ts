/**
 * Query Keys Factory
 * Centralized query keys for React Query cache management
 */

import type { ProductFilters, OrderFilters, ListUsersQuery } from "@/types";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters?: ProductFilters) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    bySlug: (slug: string) =>
      [...queryKeys.products.details(), "slug", slug] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    bySlug: (slug: string) =>
      [...queryKeys.categories.details(), "slug", slug] as const,
  },
  cart: {
    all: ["cart"] as const,
    current: () => [...queryKeys.cart.all, "current"] as const,
  },
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: OrderFilters) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  payments: {
    all: ["payments"] as const,
    details: () => [...queryKeys.payments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    byOrderId: (orderId: string) =>
      [...queryKeys.payments.details(), "order", orderId] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    lists: () => [...queryKeys.addresses.all, "list"] as const,
    list: () => [...queryKeys.addresses.lists()] as const,
    details: () => [...queryKeys.addresses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.addresses.details(), id] as const,
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (query?: ListUsersQuery) =>
      [...queryKeys.users.lists(), query] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    byEmail: (email: string) =>
      [...queryKeys.users.details(), "email", email] as const,
  },
  ar: {
    all: ["ar"] as const,
    snapshots: () => [...queryKeys.ar.all, "snapshots"] as const,
    snapshotList: () => [...queryKeys.ar.snapshots(), "list"] as const,
    details: () => [...queryKeys.ar.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.ar.details(), id] as const,
  },
  glassesTryOn: {
    all: ["glassesTryOn"] as const,
    products: () => [...queryKeys.glassesTryOn.all, "products"] as const,
    productList: (params?: { page?: number; pageSize?: number }) =>
      [...queryKeys.glassesTryOn.products(), "list", params] as const,
  },
};
