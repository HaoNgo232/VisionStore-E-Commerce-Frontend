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

/**
 * Interface for Orders Service
 * Defines contract for order management operations
 */
export interface IOrdersService {
  /**
   * Get all orders for current user
   */
  getAll(): Promise<PaginatedOrdersResponse>;

  /**
   * Get order by ID
   */
  getById(orderId: string): Promise<Order>;

  /**
   * Create new order
   */
  create(data: CreateOrderRequest): Promise<Order>;

  /**
   * Update order status
   */
  updateStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order>;

  /**
   * Cancel order
   */
  cancel(orderId: string): Promise<Order>;

  /**
   * Delete order
   */
  delete(orderId: string): Promise<void>;

  /**
   * List all orders (Admin only)
   * Filters: status, paymentStatus, search, date range
   */
  listAllOrders(query?: OrderAdminListQuery): Promise<PaginatedOrdersResponse>;
}

/**
 * Orders Service Implementation
 * Handles order management with runtime validation
 */
export class OrdersService implements IOrdersService {
  /**
   * Build URLSearchParams from OrderAdminListQuery
   * Private helper method for query parameter construction
   */
  private buildOrderQueryParams(
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

  /**
   * Get all orders for current user
   */
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
  }

  /**
   * Get order by ID
   */
  async getById(orderId: string): Promise<Order> {
    return apiGetValidated<Order>(
      `/orders/${orderId}`,
      OrderSchema as z.ZodType<Order>,
    );
  }

  /**
   * Create new order
   */
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
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> {
    return apiPatchValidated<Order, UpdateOrderStatusRequest>(
      `/orders/${orderId}/status`,
      OrderSchema as z.ZodType<Order>,
      data,
    );
  }

  /**
   * Cancel order
   */
  async cancel(orderId: string): Promise<Order> {
    return apiPatchValidated<Order, Record<string, never>>(
      `/orders/${orderId}/cancel`,
      OrderSchema as z.ZodType<Order>,
      {},
    );
  }

  /**
   * Delete order
   */
  async delete(orderId: string): Promise<void> {
    return apiDelete<void>(`/orders/${orderId}`);
  }

  /**
   * List all orders (Admin only)
   * Filters: status, paymentStatus, search, date range
   */
  async listAllOrders(
    query?: OrderAdminListQuery,
  ): Promise<PaginatedOrdersResponse> {
    const searchParams = this.buildOrderQueryParams(query);
    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/orders/admin/all?${queryString}`
      : "/orders/admin/all";

    return apiGetValidated<PaginatedOrdersResponse>(
      endpoint,
      PaginatedOrdersResponseSchema as z.ZodType<PaginatedOrdersResponse>,
    );
  }
}

/**
 * Default instance of OrdersService
 * Export singleton instance for backward compatibility
 */
export const ordersApi = new OrdersService();
