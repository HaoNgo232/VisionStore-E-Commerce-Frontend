/**
 * Orders Service
 * API integration for order management
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "@/types";

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    return apiGet<Order[]>("/orders");
  },

  async getById(orderId: string): Promise<Order> {
    return apiGet<Order>(`/orders/${orderId}`);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    return apiPost<Order>("/orders", data);
  },

  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> {
    return apiPatch<Order>(`/orders/${orderId}/status`, data);
  },

  async cancel(orderId: string): Promise<Order> {
    return apiPatch<Order>(`/orders/${orderId}/cancel`, {});
  },

  async delete(orderId: string): Promise<void> {
    return apiDelete(`/orders/${orderId}`);
  },
};
