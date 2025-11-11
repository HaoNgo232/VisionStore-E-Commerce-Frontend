/**
 * Payments API Service
 * Handles payment processing (COD, SePay) and status checking with runtime validation
 */

import { apiPostValidated, apiGetValidated } from "@/lib/api-client";
import type {
  PaymentProcessRequest,
  PaymentProcessResponse,
  Payment,
  PaymentMethod,
} from "@/types";
import { PaymentProcessResponseSchema, PaymentSchema } from "@/types";
import { type z } from "zod";

/**
 * Interface for Payments Service
 * Defines contract for payment processing operations
 */
export interface IPaymentsService {
  /**
   * Process payment for an order
   * @param orderId - Order ID to process payment for
   * @param method - Payment method (COD or SEPAY)
   * @param amountInt - Amount in cents
   * @returns Payment response with QR code for SePay or confirmation for COD
   */
  process(
    orderId: string,
    method: PaymentMethod,
    amountInt: number,
  ): Promise<PaymentProcessResponse>;

  /**
   * Get payment status for an order
   * @param orderId - Order ID to check payment for
   * @returns Payment details including status and metadata
   */
  getByOrder(orderId: string): Promise<Payment>;

  /**
   * Get payment by ID
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  getById(paymentId: string): Promise<Payment>;

  /**
   * Confirm COD payment (admin/shipper only)
   * Called after delivering order and receiving cash from customer
   * @param orderId - Order ID with COD payment
   * @returns Updated payment with PAID status
   */
  confirmCod(orderId: string): Promise<Payment>;
}

/**
 * Payments Service Implementation
 * Handles payment processing (COD, SePay) and status checking with runtime validation
 */
export class PaymentsService implements IPaymentsService {
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

    return apiPostValidated<PaymentProcessResponse, PaymentProcessRequest>(
      "/payments/process",
      PaymentProcessResponseSchema as z.ZodType<PaymentProcessResponse>,
      payload,
    );
  }

  /**
   * Get payment status for an order
   * @param orderId - Order ID to check payment for
   * @returns Payment details including status and metadata
   */
  async getByOrder(orderId: string): Promise<Payment> {
    return apiGetValidated<Payment>(
      `/payments/order/${orderId}`,
      PaymentSchema as z.ZodType<Payment>,
    );
  }

  /**
   * Get payment by ID
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  async getById(paymentId: string): Promise<Payment> {
    return apiGetValidated<Payment>(
      `/payments/${paymentId}`,
      PaymentSchema as z.ZodType<Payment>,
    );
  }

  /**
   * Confirm COD payment (admin/shipper only)
   * Called after delivering order and receiving cash from customer
   * @param orderId - Order ID with COD payment
   * @returns Updated payment with PAID status
   */
  async confirmCod(orderId: string): Promise<Payment> {
    return apiPostValidated<Payment, Record<string, never>>(
      `/payments/confirm-cod/${orderId}`,
      PaymentSchema as z.ZodType<Payment>,
      {},
    );
  }
}

/**
 * Default instance of PaymentsService
 * Export singleton instance for backward compatibility
 */
export const paymentsApi = new PaymentsService();
