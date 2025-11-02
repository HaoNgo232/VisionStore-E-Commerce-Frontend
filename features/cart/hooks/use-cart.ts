/**
 * useCart Hook
 * Fetches and manages shopping cart
 */

"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart.store";

export function useCart() {
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

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  if (!mounted) {
    return {
      cart: null,
      loading: true,
      error: null,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      getItemCount,
      getTotal,
    };
  }

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
  };
}
