/* eslint-disable react-hooks/exhaustive-deps */
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
  pageSize?: number;
  categorySlug?: string;
  search?: string;
  minPriceInt?: number;
  maxPriceInt?: number;
}

export function useProducts(params?: UseProductsParams): {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
} {
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

        setProducts(data?.products || []);
        setTotal(data?.total || 0);
      } catch (err) {
        setError(getErrorMessage(err));
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, [
    params?.page,
    params?.pageSize,
    params?.categorySlug,
    params?.search,
    params?.minPriceInt,
    params?.maxPriceInt,
  ]);

  return { products, total, loading, error };
}
