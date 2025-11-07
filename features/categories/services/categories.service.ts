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
} from "@/types";
import { CategorySchema, z } from "@/types";

// CategoryTree schema - recursive
const CategoryTreeSchema: z.ZodType<CategoryTree> = CategorySchema.extend({
  children: z.lazy(() => z.array(CategoryTreeSchema).optional()),
});

export const categoriesApi = {
  /**
   * Fetch all categories
   */
  async getAll(): Promise<Category[]> {
    return apiGetValidated<Category[]>("/categories", z.array(CategorySchema));
  },

  /**
   * Fetch categories as tree structure (with nesting)
   */
  async getTree(): Promise<CategoryTree[]> {
    return apiGetValidated<CategoryTree[]>(
      "/categories/tree",
      z.array(CategoryTreeSchema),
    );
  },

  /**
   * Fetch single category by ID
   */
  async getById(id: string): Promise<Category> {
    return apiGetValidated<Category>(`/categories/${id}`, CategorySchema);
  },

  /**
   * Create new category (admin only)
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiPostValidated<Category, CreateCategoryRequest>(
      "/categories",
      CategorySchema,
      data,
    );
  },

  /**
   * Update category (admin only)
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return apiPatchValidated<Category, UpdateCategoryRequest>(
      `/categories/${id}`,
      CategorySchema,
      data,
    );
  },

  /**
   * Delete category (admin only)
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/categories/${id}`);
  },
};
