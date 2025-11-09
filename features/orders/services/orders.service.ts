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
import type { OrderAdminListQuery } from "@/types/order.types";
import { OrderSchema, PaginatedOrdersResponseSchema } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { type z } from "zod";

export const ordersApi = {
  async getAll(): Promise<PaginatedOrdersResponse> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiGetValidated<PaginatedOrdersResponse>(
      "/orders",
      PaginatedOrdersResponseSchema as z.ZodType<PaginatedOrdersResponse>,
      {
        params: { userId },
      },
    );
  },

  async getById(orderId: string): Promise<Order> {
    return apiGetValidated<Order>(
      `/orders/${orderId}`,
      OrderSchema as z.ZodType<Order>,
    );
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated - userId is missing");
    }
    return apiPostValidated<Order, CreateOrderRequest & { userId: string }>(
      "/orders",
      OrderSchema as z.ZodType<Order>,
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
      OrderSchema as z.ZodType<Order>,
      data,
    );
  },

  async cancel(orderId: string): Promise<Order> {
    return apiPatchValidated<Order, Record<string, never>>(
      `/orders/${orderId}/cancel`,
      OrderSchema as z.ZodType<Order>,
      {},
    );
  },

  async delete(orderId: string): Promise<void> {
    return apiDelete<void>(`/orders/${orderId}`);
  },

  /**
   * List all orders (Admin only)
   * Filters: status, paymentStatus, search, date range
   */
  async listAllOrders(
    query?: OrderAdminListQuery,
  ): Promise<PaginatedOrdersResponse> {
    const searchParams = buildOrderQueryParams(query);
    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/orders/admin/all?${queryString}`
      : "/orders/admin/all";

    return apiGetValidated<PaginatedOrdersResponse>(
      endpoint,
      PaginatedOrdersResponseSchema as z.ZodType<PaginatedOrdersResponse>,
    );
  },
};

/**
 * Build URLSearchParams from OrderAdminListQuery
 */
function buildOrderQueryParams(
  query: OrderAdminListQuery | undefined,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (query === undefined) {
    return searchParams;
  }

  if (query.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
  if (query.pageSize !== undefined) {
    searchParams.set("pageSize", query.pageSize.toString());
  }
  if (query.status !== undefined) {
    searchParams.set("status", query.status);
  }
  if (query.paymentStatus !== undefined) {
    searchParams.set("paymentStatus", query.paymentStatus);
  }
  if (query.search !== undefined && query.search !== "") {
    searchParams.set("search", query.search);
  }
  if (query.startDate !== undefined) {
    searchParams.set("startDate", query.startDate);
  }
  if (query.endDate !== undefined) {
    searchParams.set("endDate", query.endDate);
  }

  return searchParams;
}
