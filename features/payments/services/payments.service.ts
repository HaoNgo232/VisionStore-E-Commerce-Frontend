/**
 * Payments Service
 * Handles payment processing, COD confirmation, and SePay QR generation
 */

import { apiPost } from "@/lib/api-client";
import type {
  CODPaymentRequest,
  CODPaymentResponse,
  SepayPaymentRequest,
  SepayQRResponse,
  SepayVerifyRequest,
  SepayVerifyResponse,
} from "@/types";

export const paymentsApi = {
  /**
   * Confirm COD (Cash on Delivery) payment
   */
  async confirmCOD(data: CODPaymentRequest): Promise<CODPaymentResponse> {
    return apiPost<CODPaymentResponse>("/payments/cod/confirm", data);
  },

  /**
   * Generate SePay QR code for transfer
   */
  async generateSepayQR(data: SepayPaymentRequest): Promise<SepayQRResponse> {
    return apiPost<SepayQRResponse>("/payments/sepay/qr", data);
  },

  /**
   * Verify SePay payment
   */
  async verifySepay(data: SepayVerifyRequest): Promise<SepayVerifyResponse> {
    return apiPost<SepayVerifyResponse>("/payments/sepay/verify", data);
  },
};
