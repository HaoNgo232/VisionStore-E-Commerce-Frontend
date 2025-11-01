/**
 * Product Types
 * Product, category, and filter types
 */

import type { Category } from "./category.types";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  priceInt: number; // cents format (199900 = 1,999.00 VND)
  stock: number; // Available quantity
  description: string | null;
  imageUrls: string[]; // Image URLs
  categoryId: string | null;
  attributes: Record<string, unknown> | null; // Contains brand, frameType, material, color, etc.
  model3dUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null; // Optional populated category
}

/**
 * Product filter criteria
 */
export interface ProductFilters {
  categoryId?: string;
  priceRange?: [number, number]; // [min, max] in cents
  search?: string;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

/**
 * Product sort options
 */
export type ProductSortBy =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular"
  | "trending";

/**
 * Create product request (admin only)
 */
export interface CreateProductRequest {
  sku: string;
  name: string;
  slug: string;
  priceInt: number; // cents
  stock: number;
  description?: string;
  imageUrls: string[];
  categoryId?: string;
  attributes?: Record<string, unknown>;
  model3dUrl?: string;
}

/**
 * Update product request (admin only)
 */
export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  slug?: string;
  priceInt?: number;
  stock?: number;
  description?: string;
  imageUrls?: string[];
  categoryId?: string;
  attributes?: Record<string, unknown>;
  model3dUrl?: string;
}

/**
 * Product review
 */
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}
