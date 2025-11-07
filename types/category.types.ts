/**
 * Category Types
 * Product category and related types
 */

import { z } from "zod";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
}

/**
 * Zod schema for Category (without nested relations)
 */
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Note: parent and children are optional populated fields
});

/**
 * Category tree structure (with nested children)
 */
export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

/**
 * Create category request (admin only)
 */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

/**
 * Update category request (admin only)
 */
export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
}
