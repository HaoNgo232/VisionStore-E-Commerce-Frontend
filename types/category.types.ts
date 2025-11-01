/**
 * Category Types
 * Product category and related types
 */

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
