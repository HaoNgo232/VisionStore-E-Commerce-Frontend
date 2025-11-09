/**
 * Products React Query Hooks
 * Hooks for product data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { productsApi, type GetProductsParams } from "../services/products.service";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateProductRequest, CreateProductRequest, Product, PaginatedResponse } from "@/types";

/**
 * Get paginated products list
 */
export function useProducts(params?: GetProductsParams): UseQueryResult<PaginatedResponse<Product>, Error> {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.getAll(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get single product by ID
 */
export function useProduct(productId: string): UseQueryResult<Product, Error> {
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
export function useProductBySlug(slug: string): UseQueryResult<Product, Error> {
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
export function useCreateProduct(): UseMutationResult<Product, Error, CreateProductRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      // Invalidate products list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

/**
 * Update product mutation (admin only)
 */
export function useUpdateProduct(): UseMutationResult<Product, Error, { id: string; data: UpdateProductRequest }, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

/**
 * Delete product mutation (admin only)
 */
export function useDeleteProduct(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onSuccess: () => {
      // Invalidate products list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

