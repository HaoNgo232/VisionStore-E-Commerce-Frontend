/**
 * Categories Service
 * Handles all category-related API calls with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
} from "@/lib/api-client";
import type {
  Category,
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedCategoriesResponse,
} from "@/types";
import { CategorySchema, PaginatedCategoriesResponseSchema } from "@/types";
import { z } from "zod";

// CategoryTree schema - recursive
const CategoryTreeSchema: z.ZodType<CategoryTree> = CategorySchema.extend({
  children: z.lazy(() => z.array(CategoryTreeSchema)),
});

const CategoryArraySchema: z.ZodType<Category[]> = z.array(CategorySchema);
const CategoryTreeArraySchema: z.ZodType<CategoryTree[]> =
  z.array(CategoryTreeSchema);

/**
 * Interface for Categories Service
 * Defines contract for category management operations
 */
export interface ICategoriesService {
  /**
   * Fetch all categories
   * Backend returns paginated response, so we unwrap the categories array
   */
  getAll(): Promise<Category[]>;

  /**
   * Fetch categories as tree structure (with nesting)
   */
  getTree(): Promise<CategoryTree[]>;

  /**
   * Fetch single category by ID
   */
  getById(id: string): Promise<Category>;

  /**
   * Create new category (admin only)
   */
  create(data: CreateCategoryRequest): Promise<Category>;

  /**
   * Update category (admin only)
   */
  update(id: string, data: UpdateCategoryRequest): Promise<Category>;

  /**
   * Delete category (admin only)
   */
  delete(id: string): Promise<void>;
}

/**
 * Categories Service Implementation
 * Handles all category-related API calls with runtime validation
 */
export class CategoriesService implements ICategoriesService {
  /**
   * Fetch all categories
   * Backend returns paginated response, so we unwrap the categories array
   */
  async getAll(): Promise<Category[]> {
    const response = await apiGetValidated<PaginatedCategoriesResponse>(
      "/categories",
      PaginatedCategoriesResponseSchema,
    );
    return response.categories;
  }

  /**
   * Fetch categories as tree structure (with nesting)
   */
  async getTree(): Promise<CategoryTree[]> {
    return apiGetValidated<CategoryTree[]>(
      "/categories/tree",
      CategoryTreeArraySchema,
    );
  }

  /**
   * Fetch single category by ID
   */
  async getById(id: string): Promise<Category> {
    return apiGetValidated<Category>(`/categories/${id}`, CategorySchema);
  }

  /**
   * Create new category (admin only)
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiPostValidated<Category, CreateCategoryRequest>(
      "/categories",
      CategorySchema,
      data,
    );
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return apiPatchValidated<Category, UpdateCategoryRequest>(
      `/categories/${id}`,
      CategorySchema,
      data,
    );
  }

  /**
   * Delete category (admin only)
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/categories/${id}`);
  }
}

/**
 * Default instance of CategoriesService
 * Export singleton instance for backward compatibility
 */
export const categoriesApi = new CategoriesService();
