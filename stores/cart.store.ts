"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/features/cart/services/cart.service";
import { toast } from "sonner";
import type { Cart } from "@/types";

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Utils
  getItemCount: () => number;
  getTotal: () => number;
  reset: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null,

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const cart = await cartApi.getCart();
          set({ cart });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch cart";
          set({ error: message });
          toast.error(message);
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (productId: string, quantity: number) => {
        // Prevent multiple simultaneous adds
        if (get().loading) {
          console.warn("Add to cart already in progress");
          return;
        }

        set({ loading: true });
        try {
          if (quantity <= 0) {
            throw new Error("Số lượng phải lớn hơn 0");
          }

          const cart = await cartApi.addItem({ productId, quantity });
          set({ cart, error: null });
          toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng";
          set({ error: message });

          // Only show toast if not a duplicate request
          if (!message.includes("progress")) {
            toast.error(message);
          }
        } finally {
          set({ loading: false });
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        try {
          // Get product ID from cart item
          const item = get().cart?.items.find((i) => i.id === itemId);
          if (!item) throw new Error("Item not found");

          const cart = await cartApi.updateItem(itemId, {
            productId: item.productId,
            quantity,
          });
          set({ cart, error: null });
          toast.success(`Đã cập nhật giỏ hàng`);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to update item";
          set({ error: message });
          toast.error(message);
        }
      },

      removeItem: async (itemId: string) => {
        try {
          // Get product ID from cart item
          const item = get().cart?.items.find((i) => i.id === itemId);
          if (!item) throw new Error("Item not found");

          const cart = await cartApi.removeItem(itemId, item.productId);
          set({ cart, error: null });
          toast.success(`Đã xoá khỏi giỏ hàng`);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to remove item";
          set({ error: message });
          toast.error(message);
        }
      },

      clearCart: async () => {
        set({ loading: true });
        try {
          await cartApi.clearCart();
          set({ cart: null, error: null });
          toast.success(`Đã xoá giỏ hàng`);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to clear cart";
          set({ error: message });
          toast.error(message);
        } finally {
          set({ loading: false });
        }
      },

      getItemCount: () => {
        const { cart } = get();
        // Return total quantity, not number of unique items
        return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
      },

      getTotal: () => {
        const { cart } = get();
        return cart ? cart.totalInt : 0;
      },

      reset: () => {
        set({ cart: null, loading: false, error: null });
      },
    }),
    {
      name: "cart-store",
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
