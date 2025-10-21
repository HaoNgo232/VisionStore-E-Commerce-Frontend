/**
 * Product feature utilities
 */

import type { Product } from "@/types";

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  salePrice: number,
): number {
  if (originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Check if product is on sale
 */
export function isOnSale(product: Product): boolean {
  return !!product.originalPrice && product.originalPrice > product.price;
}

/**
 * Get price display text
 */
export function getPriceDisplay(product: Product): {
  current: string;
  original?: string;
  discount?: number;
} {
  const current = formatPrice(product.price);

  if (!product.originalPrice) {
    return { current };
  }

  return {
    current,
    original: formatPrice(product.originalPrice),
    discount: calculateDiscount(product.originalPrice, product.price),
  };
}

/**
 * Filter products by stock status
 */
export function filterInStock(products: Product[]): Product[] {
  return products.filter((p) => p.inStock);
}

/**
 * Group products by category
 */
export function groupByCategory(
  products: Product[],
): Record<string, Product[]> {
  return products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
}

/**
 * Get unique values from products
 */
export function getUniqueValues<K extends keyof Product>(
  products: Product[],
  key: K,
): Product[K][] {
  return Array.from(new Set(products.map((p) => p[key])));
}

/**
 * Search products by query
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();

  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  });
}
