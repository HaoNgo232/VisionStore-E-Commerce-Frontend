/**
 * Products React Query Hooks
 * Hooks for product data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, type GetProductsParams } from "../services/products.service";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateProductRequest, CreateProductRequest } from "@/types";

/**
 * Get paginated products list
 */
export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.getAll(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get single product by ID
 */
export function useProduct(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productsApi.getById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single product by slug
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.bySlug(slug),
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create product mutation (admin only)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

/**
 * Update product mutation (admin only)
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

/**
 * Delete product mutation (admin only)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

