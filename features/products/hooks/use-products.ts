/**
 * useProducts Hook
 * Fetches and manages product listing with pagination
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { productsApi } from "@/features/products/services/products.service";
import type { Product } from "@/types";

interface UseProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export function useProducts(params?: UseProductsParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getAll(params);
        setProducts(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [
    params?.page,
    params?.limit,
    params?.categoryId,
    params?.search,
    params?.sortBy,
    params?.order,
  ]);

  return { products, total, loading, error };
}
