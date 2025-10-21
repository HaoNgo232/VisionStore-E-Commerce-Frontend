/**
 * Product feature specific types
 */

import type { Product, ProductFilters } from "@/types";

export interface ProductListState {
  products: Product[];
  filters: ProductFilters;
  sortBy: string;
  view: "grid" | "list";
}

export interface ProductDetailState {
  product: Product | null;
  selectedImage: number;
  quantity: number;
  selectedVariant?: string;
}

export interface ProductSearchState {
  query: string;
  results: Product[];
  recentSearches: string[];
}

export type ProductSortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest"
  | "name";

export interface ProductViewConfig {
  showQuickView: boolean;
  showCompare: boolean;
  showWishlist: boolean;
}
