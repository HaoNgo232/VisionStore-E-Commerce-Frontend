/**
 * Orders React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../services/orders.service";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilters,
} from "@/types";

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => ordersApi.getAll(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusRequest;
    }) => ordersApi.updateStatus(orderId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancel(orderId),
    onSuccess: (_, orderId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

