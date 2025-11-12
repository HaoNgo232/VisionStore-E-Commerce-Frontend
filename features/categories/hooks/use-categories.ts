/**
 * useCategories Hook
 * Fetches and manages categories
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { categoriesApi } from "@/features/categories/services/categories.service";
import type { Category, CategoryTree } from "@/types";

export function useCategories(): {
  categories: Category[];
  loading: boolean;
  error: string | null;
} {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { categories, loading, error };
}

/**
 * useCategoryTree Hook
 * Fetches categories as tree structure
 * Note: Not implemented yet
 */
export function useCategoryTree(): {
  tree: CategoryTree[];
  loading: boolean;
  error: string | null;
} {
  const [tree, setTree] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoriesApi.getTree();
        setTree(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { tree, loading, error };
}
