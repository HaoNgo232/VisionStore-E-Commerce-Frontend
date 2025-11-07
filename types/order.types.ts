/**
 * Order Types
 * Orders, order items, and checkout related types
 * Note: Order and OrderItem types match backend @shared/types/order.types.ts
 */

import { z } from "zod";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

/**
 * Zod schemas for enums
 */
export const OrderStatusSchema = z.nativeEnum(OrderStatus);
export const PaymentStatusSchema = z.nativeEnum(PaymentStatus);

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Product name snapshot at order time
  imageUrls: string[]; // Product image URLs snapshot
  quantity: number;
  priceInt: number; // Price at time of purchase (VND)
  createdAt: string; // JSON serialized from Date
}

/**
 * Zod schema for OrderItem
 */
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  imageUrls: z.array(z.string().url()),
  quantity: z.number().int().positive(),
  priceInt: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export interface Order {
  id: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalInt: number; // VND
  items: OrderItem[];
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

/**
 * Zod schema for Order
 */
export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  addressId: z.string().uuid().nullable(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  totalInt: z.number().int().nonnegative(),
  items: z.array(OrderItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface CreateOrderRequest {
  addressId?: string; // Optional in backend
  items: {
    productId: string;
    quantity: number;
    priceInt: number; // Price snapshot in VND
  }[];
}

/**
 * Update order status request (admin only)
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

/**
 * Order history filters
 */
export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Zod schema for PaginatedOrdersResponse
 */
export const PaginatedOrdersResponseSchema = z.object({
  orders: z.array(OrderSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative().optional(),
});
