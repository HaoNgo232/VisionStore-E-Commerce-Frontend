/**
 * Order Types
 * Orders, order items, and checkout related types
 */

export interface Order {
  id: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalInt: number; // cents
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceInt: number; // cents at time of purchase
  totalInt: number; // cents
  product?: {
    id: string;
    name: string;
    priceInt: number;
    imageUrls: string[];
  } | null;
}

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

/**
 * Payment status
 */
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  addressId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

/**
 * Update order status request (admin only)
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
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
