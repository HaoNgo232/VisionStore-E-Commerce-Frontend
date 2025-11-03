/**
 * Orders Service
 * API integration for order management
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  PaginatedOrdersResponse,
} from "@/types";
import { useAuthStore } from "@/stores/auth.store";

export const ordersApi = {
  async getAll(): Promise<PaginatedOrdersResponse> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiGet<PaginatedOrdersResponse>("/orders", {
      params: { userId },
    });
  },

  async getById(orderId: string): Promise<Order> {
    return apiGet<Order>(`/orders/${orderId}`);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiPost<Order>("/orders", {
      ...data,
      userId,
    });
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
