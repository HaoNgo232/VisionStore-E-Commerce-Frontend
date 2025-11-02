/**
 * Order Types
 * Orders, order items, and checkout related types
 * Note: Order and OrderItem types match backend @shared/types/order.types.ts
 */

export interface Order {
  id: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalInt: number; // cents
  items: OrderItem[];
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceInt: number; // Price at time of purchase (cents)
  createdAt: string; // Added to match backend
  product?: {
    id: string;
    name: string;
    priceInt: number;
    imageUrls: string[];
  } | null;
}

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

export interface CreateOrderRequest {
  addressId?: string; // Optional in backend
  items: {
    productId: string;
    quantity: number;
    priceInt: number; // Price snapshot in cents
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
