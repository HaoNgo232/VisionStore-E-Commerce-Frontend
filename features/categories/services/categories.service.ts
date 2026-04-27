/**
 * Categories Service
 * Handles all category-related API calls with runtime validation
 * Falls back to mock data when API is unavailable (Dev/PoC Mode)
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
import { mockCategories } from "@/lib/data";

// CategoryTree schema - recursive
const CategoryTreeSchema: z.ZodType<CategoryTree> = CategorySchema.extend({
  children: z.lazy(() => z.array(CategoryTreeSchema)),
}) as z.ZodType<CategoryTree>;

const CategoryTreeArraySchema: z.ZodType<CategoryTree[]> = z.array(
  CategoryTreeSchema,
) as z.ZodType<CategoryTree[]>;

// Type-annotated schemas for compatibility
const CategorySchemaTyped: z.ZodType<Category> =
  CategorySchema as z.ZodType<Category>;
const PaginatedCategoriesResponseSchemaTyped: z.ZodType<PaginatedCategoriesResponse> =
  PaginatedCategoriesResponseSchema as z.ZodType<PaginatedCategoriesResponse>;

/**
 * Interface for Categories Service
 * Defines contract for category management operations
 */
export interface ICategoriesService {
  getAll(): Promise<Category[]>;
  getTree(): Promise<CategoryTree[]>;
  getById(id: string): Promise<Category>;
  create(data: CreateCategoryRequest): Promise<Category>;
  update(id: string, data: UpdateCategoryRequest): Promise<Category>;
  delete(id: string): Promise<void>;
}

/**
 * Categories Service Implementation
 * Handles all category-related API calls with fallback to mock data
 */
export class CategoriesService implements ICategoriesService {
  /**
   * Fetch all categories
   * Backend returns paginated response, unwrap the categories array
   */
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiGetValidated<PaginatedCategoriesResponse>(
        "/categories",
        PaginatedCategoriesResponseSchemaTyped,
      );
      return response.categories;
    } catch (error) {
      console.warn("Categories API unavailable, falling back to mock data");
      return mockCategories;
    }
  }

  /**
   * Fetch categories as tree structure
   */
  async getTree(): Promise<CategoryTree[]> {
    try {
      return await apiGetValidated<CategoryTree[]>(
        "/categories/tree",
        CategoryTreeArraySchema,
      );
    } catch (error) {
      console.warn("Categories Tree API unavailable, simulating tree from mock data");
      return mockCategories.map(cat => ({ ...cat, children: [] }));
    }
  }

  /**
   * Fetch single category by ID
   */
  async getById(id: string): Promise<Category> {
    try {
      return await apiGetValidated<Category>(`/categories/${id}`, CategorySchemaTyped);
    } catch (error) {
      const category = mockCategories.find(c => c.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    }
  }

  /**
   * Create new category (Mock implementation)
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    try {
      return await apiPostValidated<Category, CreateCategoryRequest>(
        "/categories",
        CategorySchemaTyped,
        data,
      );
    } catch (error) {
      console.warn("API unavailable, simulating create category");
      return {
        ...data,
        id: `mock-cat-${Date.now()}`,
        imageUrl: "/images/placeholder.jpg",
      } as Category;
    }
  }

  /**
   * Update category (Mock implementation)
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      return await apiPatchValidated<Category, UpdateCategoryRequest>(
        `/categories/${id}`,
        CategorySchemaTyped,
        data,
      );
    } catch (error) {
      console.warn("API unavailable, simulating update category");
      const category = mockCategories.find(c => c.id === id);
      if (!category) throw new Error("Category not found");
      return { ...category, ...data } as Category;
    }
  }

  /**
   * Delete category (Mock implementation)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiDelete<void>(`/categories/${id}`);
    } catch (error) {
      console.warn("API unavailable, simulating delete category");
    }
  }
}

/**
 * Default instance of CategoriesService
 */
export const categoriesApi = new CategoriesService();
