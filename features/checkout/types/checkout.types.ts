/**
 * Checkout Feature Types
 * Type definitions for checkout flow state and validation
 */

import { z } from "zod";
import type { PaymentMethod } from "@/types";

/**
 * Checkout state interface
 * Manages user selections during checkout process
 */
export interface CheckoutState {
  selectedAddressId: string;
  selectedPayment: PaymentMethod;
  isSubmitting: boolean;
}

/**
 * Checkout validation result
 * Contains validation status and error messages
 */
export interface CheckoutValidation {
  isAddressValid: boolean;
  isCartValid: boolean;
  isReadyToCheckout: boolean;
  errors: string[];
}

/**
 * Zod schema for checkout request validation
 * Ensures all required fields are present and valid before submission
 */
export const CheckoutRequestSchema = z.object({
  addressId: z.string().min(1, "Địa chỉ giao hàng là bắt buộc"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        priceInt: z.number().int().positive(),
      }),
    )
    .min(1, "Giỏ hàng phải có ít nhất 1 sản phẩm"),
  totalInt: z.number().int().positive("Tổng giá trị không hợp lệ"),
});

/**
 * Type inferred from CheckoutRequestSchema
 */
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
