/**
 * Product feature utilities
 */

import type { Product } from "@/types";

/**
 * Format price with currency (real price - no conversion)
 * @param price Price value in VND
 * @param currency Currency code
 */
export function formatPrice(price: number, currency: string = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
  const originalPrice = product.attributes?.originalPriceInt as
    | number
    | undefined;

  if (!originalPrice) return false;
  return originalPrice > product.priceInt;
}

/**
 * Get price display text
 */
export function getPriceDisplay(product: Product): {
  current: string;
  original?: string;
  discount?: number;
} {
  const current = formatPrice(product.priceInt);
  const originalPrice = product.attributes?.originalPriceInt as
    | number
    | undefined;

  if (!originalPrice) {
    return { current };
  }

  return {
    current,
    original: formatPrice(originalPrice),
    discount: calculateDiscount(originalPrice, product.priceInt),
  };
}

/**
 * Filter products by stock status
 */
export function filterInStock(products: Product[]): Product[] {
  return products.filter((p) => p.stock > 0);
}

/**
 * Group products by category ID
 */
export function groupByCategory(
  products: Product[],
): Record<string, Product[]> {
  return products.reduce((acc, product) => {
    const categoryId = product.categoryId || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
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
    const brand = (product.attributes?.brand as string) || "";
    const description = product.description || "";

    return (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      brand.toLowerCase().includes(lowercaseQuery) ||
      description.toLowerCase().includes(lowercaseQuery)
    );
  });
}
