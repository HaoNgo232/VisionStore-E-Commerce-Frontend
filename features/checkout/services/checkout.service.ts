/**
 * Checkout Service
 * Business logic layer for checkout flow
 * Handles validation, order creation, and payment processing
 */

import { ordersApi } from "@/features/orders/services/orders.service";
import { paymentsApi } from "@/features/payments/services/payments.service";
import { PaymentMethod, type Cart } from "@/types";

/**
 * Interface for Checkout Service
 * Defines contract for checkout operations
 */
export interface ICheckoutService {
  /**
   * Validate checkout request before submission
   * @param cart - Shopping cart to validate
   * @param selectedAddressId - Selected shipping address ID
   * @returns Validation result with errors array
   */
  validateCheckoutRequest(
    cart: Cart | null,
    selectedAddressId: string,
  ): { isValid: boolean; errors: string[] };

  /**
   * Process COD (Cash on Delivery) checkout
   * Creates order only, no payment processing needed
   * @param addressId - Shipping address ID
   * @param cart - Shopping cart with items
   * @returns Order ID
   */
  processCodCheckout(
    addressId: string,
    cart: Cart,
  ): Promise<{ orderId: string }>;

  /**
   * Process SePay checkout (order + payment)
   * Creates order and processes payment to get QR code
   * @param addressId - Shipping address ID
   * @param cart - Shopping cart with items
   * @returns Order ID, payment ID, and QR code URL
   */
  processSepayCheckout(
    addressId: string,
    cart: Cart,
  ): Promise<{ orderId: string; paymentId: string; qrCode: string }>;
}

/**
 * Checkout Service Implementation
 * Handles checkout business logic with proper error handling
 */
export class CheckoutService implements ICheckoutService {
  /**
   * Validate checkout request before submission
   */
  validateCheckoutRequest(
    cart: Cart | null,
    selectedAddressId: string,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!selectedAddressId) {
      errors.push("Vui lòng chọn địa chỉ giao hàng");
    }

    if (!cart?.items || cart.items.length === 0) {
      errors.push("Giỏ hàng trống");
    }

    const invalidItems =
      cart?.items.filter((item) => !item.product?.priceInt) ?? [];
    if (invalidItems.length > 0) {
      errors.push(
        "Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng làm mới trang.",
      );
    }

    if (cart && cart.totalInt <= 0) {
      errors.push("Tổng giá trị đơn hàng không hợp lệ");
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Process COD checkout
   */
  async processCodCheckout(
    addressId: string,
    cart: Cart,
  ): Promise<{ orderId: string }> {
    const order = await ordersApi.create({
      addressId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceInt: item.product?.priceInt ?? 0,
      })),
    });

    return { orderId: order.id };
  }

  /**
   * Process SePay checkout (order + payment)
   */
  async processSepayCheckout(
    addressId: string,
    cart: Cart,
  ): Promise<{ orderId: string; paymentId: string; qrCode: string }> {
    // Create order first
    const order = await ordersApi.create({
      addressId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceInt: item.product?.priceInt ?? 0,
      })),
    });

    // Process payment
    const payment = await paymentsApi.process(
      order.id,
      PaymentMethod.SEPAY,
      cart.totalInt,
    );

    return {
      orderId: order.id,
      paymentId: payment.paymentId,
      qrCode: payment.qrCode ?? "",
    };
  }
}

/**
 * Default instance of CheckoutService
 * Export singleton instance for backward compatibility
 */
export const checkoutService = new CheckoutService();
