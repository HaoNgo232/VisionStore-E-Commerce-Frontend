/**
 * Payment Types
 * Payment methods, transactions, and payment processing
 */

export interface Payment {
  id: string;
  orderId: string;
  amount: number; // cents
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment method (COD or SEPAY)
 */
export enum PaymentMethod {
  COD = "COD",
  SEPAY = "SEPAY",
}

/**
 * Payment status
 */
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

/**
 * COD (Cash on Delivery) payment confirmation
 */
export interface CODPaymentRequest {
  orderId: string;
  amount: number; // cents
}

/**
 * COD payment confirmation response
 */
export interface CODPaymentResponse {
  success: boolean;
  orderId: string;
  transactionId: string;
  amount: number; // cents
  confirmedAt: string;
}

/**
 * SEPAY (VietQR) payment request
 */
export interface SepayPaymentRequest {
  orderId: string;
  amount: number; // cents
  accountNo: string; // Bank account number for transfer
  accountName?: string;
}

/**
 * SEPAY QR Code response
 */
export interface SepayQRResponse {
  qrCode: string; // Base64 encoded QR code image
  qrDataUrl?: string; // Data URL for QR code
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: string; // Display format
  description: string;
  transferUrl?: string; // Deep link for banking app
}

/**
 * SEPAY payment verification request
 */
export interface SepayVerifyRequest {
  orderId: string;
  transactionId?: string;
}

/**
 * SEPAY payment verification response
 */
export interface SepayVerifyResponse {
  success: boolean;
  orderId: string;
  transactionId: string;
  amount: number; // cents
  status: PaymentStatus;
  verifiedAt: string;
}

/**
 * Payment confirmation webhook
 */
export interface PaymentWebhook {
  event: "payment.completed" | "payment.failed" | "payment.refunded";
  orderId: string;
  transactionId: string;
  amount: number; // cents
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
  signature?: string; // For security verification
}

/**
 * Refund request
 */
export interface RefundRequest {
  orderId: string;
  reason: string;
  amount?: number; // cents (partial refund if not full)
}

/**
 * Refund response
 */
export interface RefundResponse {
  success: boolean;
  refundId: string;
  orderId: string;
  amount: number; // cents
  status: "pending" | "completed" | "failed";
  createdAt: string;
}
