/**
 * useProductDetail Hook
 * Fetches single product details by ID or slug
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { productsApi } from "@/features/products/services/products.service";
import type { Product } from "@/types";

interface UseProductDetailParams {
  id?: string;
  slug?: string;
}

export function useProductDetail({ id, slug }: UseProductDetailParams) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ưu tiên lấy by slug nếu có, nếu không thì lấy by id
        let data: Product;
        if (slug) {
          try {
            data = await productsApi.getBySlug(slug);
          } catch {
            // Fallback: nếu slug không hợp lệ, thử lấy theo ID
            data = await productsApi.getById(slug);
          }
        } else if (id) {
          data = await productsApi.getById(id);
        } else {
          throw new Error("Phải cung cấp id hoặc slug");
        }

        setProduct(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id || slug) {
      fetch();
    }
  }, [id, slug]);

  return { product, loading, error };
}
