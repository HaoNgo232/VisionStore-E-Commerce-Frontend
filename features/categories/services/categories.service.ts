/**
 * Categories Service
 * Handles all category-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Category,
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types";

export const categoriesApi = {
  /**
   * Fetch all categories
   */
  async getAll(): Promise<Category[]> {
    return apiGet<Category[]>("/categories");
  },

  /**
   * Fetch categories as tree structure (with nesting)
   */
  async getTree(): Promise<CategoryTree[]> {
    return apiGet<CategoryTree[]>("/categories/tree");
  },

  /**
   * Fetch single category by ID
   */
  async getById(id: string): Promise<Category> {
    return apiGet<Category>(`/categories/${id}`);
  },

  /**
   * Create new category (admin only)
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiPost<Category>("/categories", data);
  },

  /**
   * Update category (admin only)
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return apiPatch<Category>(`/categories/${id}`, data);
  },

  /**
   * Delete category (admin only)
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/categories/${id}`);
  },
};
