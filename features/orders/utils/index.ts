/**
 * Orders feature utilities
 */

import type { Order } from "@/types";
import type { OrderSummary } from "../types";

/**
 * Get order status label
 */
export function getOrderStatusLabel(status: Order["status"]): string {
  const labels: Record<Order["status"], string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status];
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: Order["status"]): string {
  const colors: Record<Order["status"], string> = {
    pending: "text-yellow-600",
    processing: "text-blue-600",
    shipped: "text-purple-600",
    delivered: "text-green-600",
    cancelled: "text-red-600",
  };
  return colors[status];
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: Order): boolean {
  return order.status === "pending" || order.status === "processing";
}

/**
 * Format order date
 */
export function formatOrderDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate order summary statistics
 */
export function calculateOrderSummary(orders: Order[]): OrderSummary {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<Order["status"], number>);

  return {
    totalOrders,
    totalSpent,
    averageOrderValue,
    ordersByStatus,
  };
}

/**
 * Sort orders by date
 */
export function sortOrdersByDate(
  orders: Order[],
  direction: "asc" | "desc" = "desc",
): Order[] {
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return direction === "desc" ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Filter orders by status
 */
export function filterOrdersByStatus(
  orders: Order[],
  status: Order["status"],
): Order[] {
  return orders.filter((order) => order.status === status);
}

/**
 * Get recent orders
 */
export function getRecentOrders(orders: Order[], count: number = 5): Order[] {
  return sortOrdersByDate(orders, "desc").slice(0, count);
}
