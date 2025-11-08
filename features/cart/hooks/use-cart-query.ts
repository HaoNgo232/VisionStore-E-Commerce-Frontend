/**
 * Cart React Query Hooks
 * Hooks for cart data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../services/cart.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import type { AddToCartRequest, UpdateCartItemRequest } from "@/types";
import { toast } from "sonner";

/**
 * Get current cart
 */
export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Add item to cart mutation
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addItem(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng",
      );
    },
  });
}

/**
 * Update cart item mutation
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateCartItemRequest;
    }) => cartApi.updateItem(itemId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      toast.success("Đã cập nhật giỏ hàng");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật giỏ hàng",
      );
    },
  });
}

/**
 * Remove item from cart mutation
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, productId }: { itemId: string; productId: string }) =>
      cartApi.removeItem(itemId, productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      toast.success("Đã xoá khỏi giỏ hàng");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Không thể xoá khỏi giỏ hàng",
      );
    },
  });
}

/**
 * Clear cart mutation
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      toast.success("Đã xoá giỏ hàng");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Không thể xoá giỏ hàng",
      );
    },
  });
}

/**
 * Helper hook to get cart item count
 */
export function useCartItemCount() {
  const { data: cart } = useCart();
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

/**
 * Helper hook to get cart total
 */
export function useCartTotal() {
  const { data: cart } = useCart();
  return cart?.totalInt ?? 0;
}

