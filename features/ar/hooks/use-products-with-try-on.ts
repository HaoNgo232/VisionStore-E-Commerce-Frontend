/**
 * useProductsWithTryOn Hook
 * React Query hook for fetching products with try-on support
 */

"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { glassesTryOnService } from "@/features/ar/services/glasses-try-on.service";
import type { GetProductsWithTryOnParams } from "@/features/ar/services/glasses-try-on.service";
import { queryKeys } from "@/lib/query-keys";
import type { ProductsWithTryOnResponse } from "@/features/ar/types/glasses-try-on.types";

/**
 * Hook to fetch products with try-on support
 */
export function useProductsWithTryOn(
  params?: GetProductsWithTryOnParams,
): UseQueryResult<ProductsWithTryOnResponse, Error> {
  return useQuery({
    queryKey: queryKeys.glassesTryOn.productList(params),
    queryFn: () => glassesTryOnService.getProductsWithTryOn(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
