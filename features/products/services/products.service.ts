/**
 * Products Service
 * Handles all product-related API calls
 */

import { apiGet, apiPost } from "@/lib/api-client";
import type { Product, ProductFilters } from "@/types";

export const productsApi = {
  /**
   * Fetch all products with optional filters
   */
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters?.category) {
      params.append("category", filters.category);
    }
    if (filters?.brand) {
      params.append("brand", filters.brand);
    }
    if (filters?.priceRange) {
      params.append("minPrice", filters.priceRange[0].toString());
      params.append("maxPrice", filters.priceRange[1].toString());
    }
    if (filters?.frameType) {
      params.append("frameType", filters.frameType);
    }
    if (filters?.color) {
      params.append("color", filters.color);
    }
    if (filters?.inStock !== undefined) {
      params.append("inStock", filters.inStock.toString());
    }

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    return apiGet<Product[]>(endpoint);
  },

  /**
   * Fetch single product by ID
   */
  async getById(id: string): Promise<Product> {
    return apiGet<Product>(`/products/${id}`);
  },

  /**
   * Create new product (admin only)
   */
  async create(data: Omit<Product, "id">): Promise<Product> {
    return apiPost<Product>("/products", data);
  },

  /**
   * Fetch featured products
   */
  async getFeatured(): Promise<Product[]> {
    return apiGet<Product[]>("/products/featured");
  },
};
