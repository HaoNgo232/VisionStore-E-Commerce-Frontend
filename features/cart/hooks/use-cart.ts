/**
 * useCart Hook
 * Fetches and manages shopping cart
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { cartApi } from "@/features/cart/services/cart.service";
import type { Cart } from "@/types";

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cartApi.getCart();
        setCart(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { cart, loading, error };
}
