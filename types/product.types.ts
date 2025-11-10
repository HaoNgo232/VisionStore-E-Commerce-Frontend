/**
 * Product Types
 * Product, category, and filter types
 */

import { z } from "zod";
import type { Category } from "./category.types";
import { CategorySchema } from "./category.types";
import {
  cuidSchema,
  preprocessImageUrls,
  preprocessDateString,
  preprocessNullableCuid,
} from "./common.types";

export interface ProductAttributes {
  // Core attributes - optional to handle incomplete data from backend
  brand?: string | undefined;
  frameShape?: string | undefined;
  frameMaterial?: string | undefined;
  color?: string | undefined;

  // Optional attributes - explicit undefined for exactOptionalPropertyTypes
  lensMaterial?: string | undefined;
  uvProtection?: string | undefined;
  gender?: "Nam" | "Nữ" | "Unisex" | undefined;
  age?: string | undefined;
  style?: string | undefined;
  weight?: string | undefined;
  type?: string | undefined;
  strength?: string | undefined;

  // Boolean features
  polarized?: boolean | undefined;
  prizm?: boolean | undefined;
  blueLight?: boolean | undefined;
  photochromic?: boolean | undefined;
  mirrored?: boolean | undefined;
  foldable?: boolean | undefined;
  multifocal?: boolean | undefined;
  eco?: boolean | undefined;

  // Allow future expansion
  [key: string]: unknown;
}

/**
 * Zod schema for ProductAttributes
 * Note: Core fields are optional to handle cases where backend may not provide all attributes
 */
export const ProductAttributesSchema = z
  .object({
    // Core fields - optional to handle incomplete data from backend
    brand: z.string().min(1).optional(),
    frameShape: z.string().min(1).optional(),
    frameMaterial: z.string().min(1).optional(),
    color: z.string().min(1).optional(),

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
  category?: Category | null | undefined; // Optional populated category - explicit undefined for exactOptionalPropertyTypes
}

/**
 * Zod schema for Product
 */
export const ProductSchema = z
  .object({
    id: cuidSchema(), // Backend uses CUID, not UUID
    sku: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    priceInt: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    description: z.string().nullable(),
    imageUrls: z.preprocess(
      preprocessImageUrls,
      z.array(z.string()).default([]),
    ),
    categoryId: z.preprocess(preprocessNullableCuid, cuidSchema().nullable()),
    attributes: z.preprocess((val) => {
      // Handle null, undefined, or empty object
      if (val === null || val === undefined) {
        return null;
      }
      if (typeof val === "object" && val !== null) {
        return val;
      }
      return null;
    }, ProductAttributesSchema.nullable()),
    model3dUrl: z.string().nullable(), // Accept any string or null, not strict URL validation
    createdAt: z.preprocess(preprocessDateString, z.string()),
    updatedAt: z.preprocess(preprocessDateString, z.string()),
    // Optional populated category field - use lazy to avoid circular dependency issues
    category: CategorySchema.nullable().optional(),
  })
  .passthrough(); // Allow additional fields from backend (e.g., Prisma metadata)

/**
 * Product filter criteria
 */
export interface ProductFilters {
  categorySlug?: string;
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
 * Note: For admin form upload, use AdminCreateProductRequest instead
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
 * Note: For admin form upload, use AdminUpdateProductRequest instead
 * Uses Partial to ensure all fields are optional and stay in sync with CreateProductRequest
 */
export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * Admin create product request with file upload support
 * Used for multipart/form-data uploads in admin panel
 */
export interface AdminCreateProductRequest {
  name: string;
  priceInt: number; // VND (price in cents)
  description?: string;
  categoryId?: string;
  image?: File; // File for multipart upload
  // Optional fields for future expansion
  sku?: string;
  slug?: string;
  stock?: number;
  attributes?: Record<string, unknown>;
  model3dUrl?: string;
}

/**
 * Admin update product request with optional file upload
 * Used for multipart/form-data uploads in admin panel
 * Note: id is passed separately to update method, not included in this type
 */
export type AdminUpdateProductRequest = Partial<AdminCreateProductRequest>;

/**
 * Product query parameters for admin list
 * Backend expects 'pageSize' not 'limit'
 * Backend expects 'categorySlug' not 'categoryId' for filtering
 */
export interface AdminProductQueryParams {
  page?: number;
  pageSize?: number; // Backend uses 'pageSize', not 'limit'
  search?: string;
  categorySlug?: string; // Backend expects categorySlug for filtering
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
  id: cuidSchema(), // Backend uses CUID, not UUID
  productId: cuidSchema(), // Backend uses CUID, not UUID
  userId: cuidSchema(), // Backend uses CUID, not UUID
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  helpful: z.number().int().nonnegative(),
  createdAt: z.preprocess(preprocessDateString, z.string()),
  updatedAt: z.preprocess(preprocessDateString, z.string()),
});
