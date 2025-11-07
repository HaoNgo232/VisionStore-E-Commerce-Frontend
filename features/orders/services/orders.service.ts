/**
 * Orders Service
 * API integration for order management with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
} from "@/lib/api-client";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  PaginatedOrdersResponse,
} from "@/types";
import {
  OrderSchema,
  PaginatedOrdersResponseSchema,
} from "@/types";
import { useAuthStore } from "@/stores/auth.store";

export const ordersApi = {
  async getAll(): Promise<PaginatedOrdersResponse> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiGetValidated<PaginatedOrdersResponse>(
      "/orders",
      PaginatedOrdersResponseSchema,
      {
        params: { userId },
      },
    );
  },

  async getById(orderId: string): Promise<Order> {
    return apiGetValidated<Order>(`/orders/${orderId}`, OrderSchema);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiPostValidated<Order, CreateOrderRequest & { userId: string }>(
      "/orders",
      OrderSchema,
      {
        ...data,
        userId,
      },
    );
  },

  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> {
    return apiPatchValidated<Order, UpdateOrderStatusRequest>(
      `/orders/${orderId}/status`,
      OrderSchema,
      data,
    );
  },

  async cancel(orderId: string): Promise<Order> {
    return apiPatchValidated<Order, Record<string, never>>(
      `/orders/${orderId}/cancel`,
      OrderSchema,
      {},
    );
  },

  async delete(orderId: string): Promise<void> {
    return apiDelete<void>(`/orders/${orderId}`);
  },
};
