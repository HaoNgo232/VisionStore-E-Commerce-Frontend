/**
 * Products Service
 * API integration for product catalog
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Product,
  PaginatedResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types";

interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const productsApi = {
  async getAll(
    params?: GetProductsParams,
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.order) queryParams.append("order", params.order);

    const query = queryParams.toString();
    return apiGet<PaginatedResponse<Product>>(
      `/products${query ? `?${query}` : ""}`,
    );
  },

  async getById(productId: string): Promise<Product> {
    return apiGet<Product>(`/products/${productId}`);
  },

  async create(data: CreateProductRequest): Promise<Product> {
    return apiPost<Product>("/products", data);
  },

  async update(
    productId: string,
    data: UpdateProductRequest,
  ): Promise<Product> {
    return apiPatch<Product>(`/products/${productId}`, data);
  },

  async delete(productId: string): Promise<void> {
    return apiDelete(`/products/${productId}`);
  },
};
