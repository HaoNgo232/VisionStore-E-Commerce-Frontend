/**
 * useOrders Hook
 * Fetches and manages user orders
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { ordersApi } from "@/features/orders/services/orders.service";
import type { Order } from "@/types";

export function useOrders(): {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
} {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.getAll();
        setOrders(response.orders);
        setTotal(response.total);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { orders, total, loading, error };
}
