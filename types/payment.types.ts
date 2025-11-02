/**
 * Payment Types
 * Payment methods, transactions, and payment processing
 * Note: Matches backend @shared/types/payment.types.ts
 */

/**
 * Payment response (matches backend PaymentResponse)
 */
export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amountInt: number; // cents
  status: PaymentStatus;
  payload?: Record<string, unknown> | null;
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

/**
 * Payment method enum (matches backend)
 */
export enum PaymentMethod {
  COD = "COD",
  SEPAY = "SEPAY",
}

/**
 * Payment status enum (matches backend)
 */
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

/**
 * Payment process request (matches backend PaymentProcessDto)
 */
export interface PaymentProcessRequest {
  orderId: string;
  method: PaymentMethod;
  amountInt: number; // cents
}

/**
 * Payment process response (matches backend PaymentProcessResponse)
 */
export interface PaymentProcessResponse {
  paymentId: string;
  status: PaymentStatus;
  paymentUrl?: string; // URL thanh toán (SePay)
  qrCode?: string; // QR code cho bank transfer
  message?: string;
}

/**
 * Payment verification request (matches backend PaymentVerifyDto)
 */
export interface PaymentVerifyRequest {
  orderId: string;
  payload: Record<string, unknown>;
}

/**
 * Payment verification response (matches backend PaymentVerifyResponse)
 */
export interface PaymentVerifyResponse {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  verified: boolean;
  transactionId?: string;
  message?: string;
}

/**
 * SePay webhook payload
 */
export interface SePayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code?: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount?: string | null;
  referenceCode: string;
  description: string;
}

/**
 * SePay webhook response
 */
export interface SePayWebhookResponse {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}
