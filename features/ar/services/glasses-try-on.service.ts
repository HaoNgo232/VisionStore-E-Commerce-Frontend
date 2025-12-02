/**
 * Glasses Try-On Service
 * API integration for glasses try-on feature
 */

import { apiGet } from "@/lib/api-client";
import type { ProductsWithTryOnResponse, ProductWithTryOn } from "../types/glasses-try-on.types";
import { ProductsWithTryOnResponseSchema, ProductWithTryOnSchema } from "../types/glasses-try-on.types";
import { type z } from "zod";

export interface GetProductsWithTryOnParams {
  page?: number;
  pageSize?: number;
}

/**
 * Interface for Glasses Try-On Service
 * Defines contract for try-on operations
 */
export interface IGlassesTryOnService {
  /**
   * Get products with try-on support
   */
  getProductsWithTryOn(
    params?: GetProductsWithTryOnParams,
  ): Promise<ProductsWithTryOnResponse>;
}

/**
 * Glasses Try-On Service Implementation
 * Handles try-on API operations with runtime validation
 */
export class GlassesTryOnService implements IGlassesTryOnService {
  /**
   * Get products with try-on support
   * Backend returns { products: ProductResponse[], total, page, pageSize }
   * Frontend filters products with tryOnImageUrl and expects { data: ProductWithTryOn[], total, page, pageSize }
   * Frontend will fetch images directly from MinIO URLs
   */
  async getProductsWithTryOn(
    params?: GetProductsWithTryOnParams,
  ): Promise<ProductsWithTryOnResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.set("page", String(params.page));
    }
    if (params?.pageSize) {
      queryParams.set("pageSize", String(params.pageSize));
    }

    const query = queryParams.toString();
    const endpoint = `/products${query ? `?${query}` : ""}`;

    // Backend returns { products: ProductResponse[], total, page, pageSize }
    // Backend always includes tryOnImageUrl in response if it exists in attributes
    const backendResponse = await apiGet<{
      products: Array<{
        id: string;
        name: string;
        priceInt: number;
        tryOnImageUrl?: string; // Extracted from attributes by backend
        imageUrls: string[];
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(endpoint);

    // Filter products that have tryOnImageUrl (frontend-side filtering)
    // Frontend will fetch images directly from MinIO URLs
    const filteredProducts = backendResponse.products.filter((p) => p.tryOnImageUrl);

    // Transform to frontend format: { data: ProductWithTryOn[], total, page, pageSize }
    const transformedData: ProductWithTryOn[] = filteredProducts.map((p) => {
      // Validate each product with Zod schema
      const validated = ProductWithTryOnSchema.parse({
        id: p.id,
        name: p.name,
        priceInt: p.priceInt,
        tryOnImageUrl: p.tryOnImageUrl!,
        imageUrls: p.imageUrls,
      });
      return validated;
    });

    // Validate and return transformed response
    return ProductsWithTryOnResponseSchema.parse({
      data: transformedData,
      total: filteredProducts.length, // Total of filtered products
      page: backendResponse.page,
      pageSize: backendResponse.pageSize,
    });
  }
}

/**
 * Default instance of GlassesTryOnService
 * Export singleton instance
 */
export const glassesTryOnService = new GlassesTryOnService();
