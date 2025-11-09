/**
 * Admin Orders React Query Hooks
 * Hooks for admin order management: list all orders, update status
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ordersApi } from "../services/orders.service";
import type {
  Order,
  UpdateOrderStatusRequest,
  PaginatedOrdersResponse,
} from "@/types";
import type { OrderAdminListQuery } from "@/types/order.types";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

/**
 * Query keys factory for admin orders
 */
export const orderAdminKeys = {
  all: ["orders", "admin"] as const,
  lists: () => [...orderAdminKeys.all, "list"] as const,
  list: (query: OrderAdminListQuery | undefined) =>
    [...orderAdminKeys.lists(), query ?? {}] as const,
};

/**
 * Get paginated admin orders list with filters
 */
export function useOrdersAdminList(
  query?: OrderAdminListQuery,
): UseQueryResult<PaginatedOrdersResponse, Error> {
  return useQuery({
    queryKey: orderAdminKeys.list(query ?? {}),
    queryFn: () => ordersApi.listAllOrders(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Update order status mutation (Admin only)
 */
export function useUpdateOrderStatus(): UseMutationResult<
  Order,
  Error,
  { orderId: string; data: UpdateOrderStatusRequest },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusRequest;
    }) => ordersApi.updateStatus(orderId, data),
    onSuccess: (updatedOrder, variables) => {
      // Invalidate all admin order lists
      void queryClient.invalidateQueries({
        queryKey: orderAdminKeys.lists(),
      });
      // Invalidate order detail query để re-render trang chi tiết
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId),
      });
      // Optimistically update order detail cache với data mới
      queryClient.setQueryData<Order>(
        queryKeys.orders.detail(variables.orderId),
        updatedOrder,
      );
      toast.success("Order status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
}
