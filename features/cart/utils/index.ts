/**
 * Cart feature utilities
 */

import type { CartItem } from "@/types";
import type { CartTotals } from "../types";

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: CartItem[],
  options: {
    shippingCost?: number;
    taxRate?: number;
    discountAmount?: number;
    freeShippingThreshold?: number;
  } = {},
): CartTotals {
  const {
    shippingCost = 30000, // 30,000 VND
    taxRate = 0.1,
    discountAmount = 0,
    freeShippingThreshold = 500000, // 500,000 VND
  } = options;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.priceInt * item.quantity,
    0,
  );

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const discount = Math.min(discountAmount, subtotal);
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
  };
}

/**
 * Get cart item count
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Find item in cart
 */
export function findCartItem(
  items: CartItem[],
  productId: string,
): CartItem | undefined {
  return items.find((item) => item.productId === productId);
}

/**
 * Check if cart has item
 */
export function hasCartItem(items: CartItem[], productId: string): boolean {
  return items.some((item) => item.productId === productId);
}

/**
 * Format shipping estimate
 */
export function formatShippingEstimate(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} business days`;
}
