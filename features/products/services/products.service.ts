/**
 * Products Service
 * API integration for product catalog with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
} from "@/lib/api-client";
import type {
  Product,
  PaginatedResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types";
import { ProductSchema } from "@/types/product.types";
import { createPaginatedResponseSchema } from "@/types/common.types";
import { z } from "zod";

// Create paginated products schema with type assertion for exactOptionalPropertyTypes compatibility
const PaginatedProductsSchema = createPaginatedResponseSchema(
  ProductSchema,
) as z.ZodType<PaginatedResponse<Product>>;

export interface GetProductsParams {
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
    if (params?.page) {
      queryParams.append("page", String(params.page));
    }
    if (params?.pageSize) {
      queryParams.append("pageSize", String(params.pageSize));
    }
    if (params?.categorySlug) {
      queryParams.append("categorySlug", params.categorySlug);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.minPriceInt) {
      queryParams.append("minPriceInt", String(params.minPriceInt));
    }
    if (params?.maxPriceInt) {
      queryParams.append("maxPriceInt", String(params.maxPriceInt));
    }

    const query = queryParams.toString();
    return apiGetValidated<PaginatedResponse<Product>>(
      `/products${query ? `?${query}` : ""}`,
      PaginatedProductsSchema,
    );
  },

  async getById(productId: string): Promise<Product> {
    return apiGetValidated<Product>(
      `/products/${productId}`,
      ProductSchema as z.ZodType<Product>,
    );
  },

  async create(data: CreateProductRequest): Promise<Product> {
    return apiPostValidated<Product, CreateProductRequest>(
      "/products",
      ProductSchema as z.ZodType<Product>,
      data,
    );
  },

  async getBySlug(slug: string): Promise<Product> {
    return apiGetValidated<Product>(
      `/products/slug/${slug}`,
      ProductSchema as z.ZodType<Product>,
    );
  },

  async update(
    productId: string,
    data: UpdateProductRequest,
  ): Promise<Product> {
    return apiPatchValidated<Product, UpdateProductRequest>(
      `/products/${productId}`,
      ProductSchema as z.ZodType<Product>,
      data,
    );
  },

  async delete(productId: string): Promise<void> {
    return apiDelete<void>(`/products/${productId}`);
  },
};
