/**
 * Payment Types
 * Payment methods, transactions, and payment processing
 */

import { z } from "zod";

export enum PaymentMethod {
  COD = "COD",
  SEPAY = "SEPAY",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

/**
 * Zod schemas for enums
 */
export const PaymentMethodSchema = z.nativeEnum(PaymentMethod);
export const PaymentStatusSchema = z.nativeEnum(PaymentStatus);

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amountInt: number; // VND
  status: PaymentStatus;
  payload?: Record<string, unknown> | null;
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

/**
 * Zod schema for Payment
 */
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: PaymentMethodSchema,
  amountInt: z.number().int().nonnegative(),
  status: PaymentStatusSchema,
  payload: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface PaymentProcessRequest {
  orderId: string;
  method: PaymentMethod;
  amountInt: number; // VND
}

export interface PaymentProcessResponse {
  paymentId: string;
  status: PaymentStatus;
  paymentUrl?: string; // URL thanh toán (SePay)
  qrCode?: string; // QR code cho bank transfer
  message?: string;
}

/**
 * Zod schema for PaymentProcessResponse
 */
export const PaymentProcessResponseSchema = z.object({
  paymentId: z.string().uuid(),
  status: PaymentStatusSchema,
  paymentUrl: z.string().url().optional(),
  qrCode: z.string().optional(),
  message: z.string().optional(),
});

export interface PaymentVerifyRequest {
  orderId: string;
  payload: Record<string, unknown>;
}

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
