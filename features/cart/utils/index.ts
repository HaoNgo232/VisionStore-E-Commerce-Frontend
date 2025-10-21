/**
 * Cart feature utilities
 */

import type { CartItem } from "@/types";
import type { CartTotals, CartValidation, CartValidationError } from "../types";

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
    shippingCost = 5.99,
    taxRate = 0.1,
    discountAmount = 0,
    freeShippingThreshold = 50,
  } = options;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
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
 * Validate cart items
 */
export function validateCart(items: CartItem[]): CartValidation {
  const errors: CartValidationError[] = [];

  // Check if cart is empty
  if (items.length === 0) {
    errors.push({
      type: "min_order",
      message: "Cart is empty",
    });
  }

  // Check stock availability
  items.forEach((item) => {
    if (!item.product.inStock) {
      errors.push({
        type: "out_of_stock",
        message: `${item.product.name} is out of stock`,
        itemId: item.productId,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
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
