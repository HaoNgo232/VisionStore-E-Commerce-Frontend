/**
 * Cart feature specific types
 */

import type { Cart } from "@/types";

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  description?: string;
}

export interface CartValidation {
  isValid: boolean;
  errors: CartValidationError[];
}

export interface CartValidationError {
  type: "out_of_stock" | "max_quantity" | "min_order" | "shipping_restriction";
  message: string;
  itemId?: string;
}

export interface CartState extends Cart {
  shippingOption?: ShippingOption;
  couponCode?: string;
  discountAmount: number;
}
