/**
 * useProductDetail Hook
 * Fetches single product details
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { productsApi } from "@/features/products/services/products.service";
import type { Product } from "@/types";

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getById(productId);
        setProduct(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [productId]);

  return { product, loading, error };
}
