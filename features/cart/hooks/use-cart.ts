/**
 * useCart Hook
 * Fetches and manages shopping cart
 */

"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import type { Cart } from "@/types";

export function useCart(): {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => number;
  mounted: boolean;
  isAuthenticated: boolean;
} {
  const [mounted, setMounted] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const loading = useCartStore((state) => state.loading);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTotal = useCartStore((state) => state.getTotal);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch cart if user is authenticated and component is mounted
    if (mounted && isAuthenticated) {
      void fetchCart();
    }
  }, [mounted, isAuthenticated, fetchCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    getTotal,
    mounted,
    isAuthenticated,
  };
}
