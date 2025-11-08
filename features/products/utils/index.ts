/**
 * Product feature utilities
 */

import type { Product, ProductAttributes } from "@/types";

/**
 * Safely get product attribute with type checking
 */
export function getProductAttribute<K extends keyof ProductAttributes>(
  product: Product,
  key: K,
): ProductAttributes[K] | undefined {
  if (!product.attributes || typeof product.attributes !== "object") {
    return undefined;
  }
  return product.attributes[key];
}

/**
 * Check if product has valid attributes
 */
export function hasValidAttributes(
  product: Product,
): product is Product & { attributes: ProductAttributes } {
  return product.attributes !== null && typeof product.attributes === "object";
}

/**
 * Format price with currency (real price - no conversion)
 * @param price Price value in VND
 * @param currency Currency code
 */
export function formatPrice(price: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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
    const categoryId = product.categoryId ?? "uncategorized";
    acc[categoryId] ??= [];
    acc[categoryId]?.push(product);
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
    const brand = product.attributes?.brand ?? "";
    const description = product.description ?? "";

    return (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      brand.toLowerCase().includes(lowercaseQuery) ||
      description.toLowerCase().includes(lowercaseQuery)
    );
  });
}
