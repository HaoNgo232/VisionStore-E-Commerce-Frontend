/**
 * Orders feature utilities
 */

import type { Order } from "@/types";
import { OrderStatus } from "@/types";
import type { OrderSummary } from "../types";

/**
 * Get order status label
 */
export function getOrderStatusLabel(status: Order["status"]): string {
  const labels: Record<Order["status"], string> = {
    [OrderStatus.PENDING]: "Pending",
    [OrderStatus.PROCESSING]: "Processing",
    [OrderStatus.SHIPPED]: "Shipped",
    [OrderStatus.DELIVERED]: "Delivered",
    [OrderStatus.CANCELLED]: "Cancelled",
  };
  return labels[status];
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: Order["status"]): string {
  const colors: Record<Order["status"], string> = {
    [OrderStatus.PENDING]: "text-yellow-600",
    [OrderStatus.PROCESSING]: "text-blue-600",
    [OrderStatus.SHIPPED]: "text-purple-600",
    [OrderStatus.DELIVERED]: "text-green-600",
    [OrderStatus.CANCELLED]: "text-red-600",
  };
  return colors[status];
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: Order): boolean {
  return (
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.PROCESSING
  );
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
  const totalSpent = orders.reduce((sum, order) => sum + order.totalInt, 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
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
export function getRecentOrders(orders: Order[], count = 5): Order[] {
  return sortOrdersByDate(orders, "desc").slice(0, count);
}
