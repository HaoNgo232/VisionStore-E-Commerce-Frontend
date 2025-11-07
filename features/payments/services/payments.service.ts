/**
 * Payments API Service
 * Handles payment processing (COD, SePay) and status checking
 */

import { apiClient } from "@/lib/api-client";
import type {
  PaymentProcessRequest,
  PaymentProcessResponse,
  Payment,
  PaymentMethod,
} from "@/types";

export const paymentsApi = {
  /**
   * Process payment for an order
   * @param orderId - Order ID to process payment for
   * @param method - Payment method (COD or SEPAY)
   * @param amountInt - Amount in cents
   * @returns Payment response with QR code for SePay or confirmation for COD
   */
  async process(
    orderId: string,
    method: PaymentMethod,
    amountInt: number,
  ): Promise<PaymentProcessResponse> {
    const payload: PaymentProcessRequest = {
      orderId,
      method,
      amountInt,
    };

    const response = await apiClient.post<PaymentProcessResponse>(
      "/payments/process",
      payload,
    );
    return response.data;
  },

  /**
   * Get payment status for an order
   * @param orderId - Order ID to check payment for
   * @returns Payment details including status and metadata
   */
  async getByOrder(orderId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/order/${orderId}`);
    return response.data;
  },

  /**
   * Get payment by ID
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  async getById(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Confirm COD payment (admin/shipper only)
   * Called after delivering order and receiving cash from customer
   * @param orderId - Order ID with COD payment
   * @returns Updated payment with PAID status
   */
  async confirmCod(orderId: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/confirm-cod/${orderId}`,
    );
    return response.data;
  },
};
