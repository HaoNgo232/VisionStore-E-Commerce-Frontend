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
  pageSize?: number;
  categorySlug?: string;
  search?: string;
  minPriceInt?: number;
  maxPriceInt?: number;
}

export const productsApi = {
  async getAll(
    params?: GetProductsParams,
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.pageSize)
      queryParams.append("pageSize", String(params.pageSize));
    if (params?.categorySlug)
      queryParams.append("categorySlug", params.categorySlug);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minPriceInt)
      queryParams.append("minPriceInt", String(params.minPriceInt));
    if (params?.maxPriceInt)
      queryParams.append("maxPriceInt", String(params.maxPriceInt));

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
