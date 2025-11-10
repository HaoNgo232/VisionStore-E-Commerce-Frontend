/**
 * Admin Products React Query Hooks
 * Hooks for admin product management with toast notifications
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { adminProductsApi } from "../services/admin-products.service";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api-client";
import type {
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductQueryParams,
  Product,
  PaginatedResponse,
} from "@/types";
import { toast } from "sonner";

/**
 * Get admin products list with filters
 */
export function useAdminProducts(
  params?: AdminProductQueryParams,
): UseQueryResult<PaginatedResponse<Product>, Error> {
  return useQuery({
    queryKey: [...queryKeys.products.lists(), "admin", params],
    queryFn: () => adminProductsApi.list(params),
    staleTime: 30 * 1000, // 30 seconds (shorter for admin, data changes frequently)
  });
}

/**
 * Get single product by ID (admin)
 */
export function useAdminProduct(
  productId: string,
): UseQueryResult<Product, Error> {
  return useQuery({
    queryKey: [...queryKeys.products.detail(productId), "admin"],
    queryFn: () => adminProductsApi.getById(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create product mutation (admin only)
 * Includes toast notifications
 */
export function useCreateProduct(): UseMutationResult<
  Product,
  Error,
  AdminCreateProductRequest,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateProductRequest) =>
      adminProductsApi.create(data),
    onSuccess: () => {
      // Invalidate products list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      toast.success("Tạo sản phẩm thành công");
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      toast.error(`Lỗi: ${message}`);
    },
  });
}

/**
 * Update product mutation (admin only)
 * Includes toast notifications
 */
export function useUpdateProduct(): UseMutationResult<
  Product,
  Error,
  { id: string; data: AdminUpdateProductRequest },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateProductRequest }) =>
      adminProductsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      toast.success("Cập nhật sản phẩm thành công");
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      toast.error(`Lỗi: ${message}`);
    },
  });
}

/**
 * Delete product mutation (admin only)
 * Includes toast notifications
 */
export function useDeleteProduct(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => adminProductsApi.delete(productId),
    onSuccess: () => {
      // Invalidate products list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      toast.success("Xóa sản phẩm thành công");
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      toast.error(`Lỗi: ${message}`);
    },
  });
}

