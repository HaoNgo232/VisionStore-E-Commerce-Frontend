/**
 * Product Types
 * Product, category, and filter types
 */

import { z } from "zod";
import type { Category } from "./category.types";

export interface ProductAttributes {
  // Core attributes
  brand: string;
  frameShape: string;
  frameMaterial: string;
  color: string;

  // Optional attributes
  lensMaterial?: string;
  uvProtection?: string;
  gender?: "Nam" | "Nữ" | "Unisex";
  age?: string;
  style?: string;
  weight?: string;
  type?: string;
  strength?: string;

  // Boolean features
  polarized?: boolean;
  prizm?: boolean;
  blueLight?: boolean;
  photochromic?: boolean;
  mirrored?: boolean;
  foldable?: boolean;
  multifocal?: boolean;
  eco?: boolean;

  // Allow future expansion
  [key: string]: unknown;
}

/**
 * Zod schema for ProductAttributes
 */
export const ProductAttributesSchema = z
  .object({
    // Required core fields
    brand: z.string().min(1),
    frameShape: z.string().min(1),
    frameMaterial: z.string().min(1),
    color: z.string().min(1),

    // Optional fields
    lensMaterial: z.string().optional(),
    uvProtection: z.string().optional(),
    gender: z.enum(["Nam", "Nữ", "Unisex"]).optional(),
    age: z.string().optional(),
    style: z.string().optional(),
    weight: z.string().optional(),
    type: z.string().optional(),
    strength: z.string().optional(),

    // Boolean features
    polarized: z.boolean().optional(),
    prizm: z.boolean().optional(),
    blueLight: z.boolean().optional(),
    photochromic: z.boolean().optional(),
    mirrored: z.boolean().optional(),
    foldable: z.boolean().optional(),
    multifocal: z.boolean().optional(),
    eco: z.boolean().optional(),
  })
  .passthrough(); // Allow unknown fields for future expansion

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  priceInt: number; // VND format (199900 = 199,900 VND)
  stock: number; // Available quantity
  description: string | null;
  imageUrls: string[]; // Image URLs
  categoryId: string | null;
  attributes: ProductAttributes | null; // Typed attributes
  model3dUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null; // Optional populated category
}

/**
 * Zod schema for Product
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  priceInt: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string().nullable(),
  imageUrls: z.array(z.string().url()),
  categoryId: z.string().uuid().nullable(),
  attributes: ProductAttributesSchema.nullable(),
  model3dUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Note: category is optional populated field, skip in schema
});

/**
 * Product filter criteria
 */
export interface ProductFilters {
  categoryId?: string;
  priceRange?: [number, number]; // [min, max] in VND
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
  priceInt: number; // VND
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

/**
 * Zod schema for ProductReview
 */
export const ProductReviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  helpful: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
