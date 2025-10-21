/**
 * Orders feature specific types
 */

import type { Order } from "@/types";

export interface OrderFilters {
  status?: Order["status"];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  ordersByStatus: Record<Order["status"], number>;
}

export interface OrderTracking {
  orderId: string;
  status: Order["status"];
  trackingNumber?: string;
  estimatedDelivery?: string;
  updates: OrderTrackingUpdate[];
}

export interface OrderTrackingUpdate {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}
