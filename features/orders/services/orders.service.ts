/**
 * Orders Service
 * Handles all order-related API calls
 */

import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import type { Order } from "@/types";

export const ordersApi = {
  /**
   * Fetch all orders for a user
   */
  async getAll(userId: string): Promise<Order[]> {
    return apiGet<Order[]>(`/orders?userId=${userId}`);
  },

  /**
   * Fetch single order by ID
   */
  async getById(id: string): Promise<Order> {
    return apiGet<Order>(`/orders/${id}`);
  },

  /**
   * Create new order
   */
  async create(data: Omit<Order, "id">): Promise<Order> {
    return apiPost<Order>("/orders", data);
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string): Promise<Order> {
    return apiPatch<Order>(`/orders/${id}`, { status });
  },

  /**
   * Cancel order
   */
  async cancel(id: string): Promise<Order> {
    return apiPatch<Order>(`/orders/${id}/cancel`, {});
  },
};
