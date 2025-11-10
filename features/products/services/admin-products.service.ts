/**
 * Admin Products Service
 * API integration for admin product management with multipart file upload support
 */

import { apiClient, apiGetValidated } from "@/lib/api-client";
import type { Product, PaginatedResponse } from "@/types";
import type {
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductQueryParams,
} from "@/types/product.types";
import { ProductSchema } from "@/types/product.types";
import { createPaginatedResponseSchema } from "@/types/common.types";
import { type z } from "zod";

// Create paginated products schema
const PaginatedProductsSchema = createPaginatedResponseSchema(
  ProductSchema,
) as z.ZodType<PaginatedResponse<Product>>;

const BASE_URL = "/products";

/**
 * Interface for Admin Products Service
 * Defines contract for admin product management operations
 */
export interface IAdminProductsService {
  /**
   * List products with filters (admin only)
   */
  list(params?: AdminProductQueryParams): Promise<PaginatedResponse<Product>>;

  /**
   * Get single product by ID (admin only)
   */
  getById(id: string): Promise<Product>;

  /**
   * Create product with multipart form data (admin only)
   * Supports file upload via FormData
   */
  create(data: AdminCreateProductRequest): Promise<Product>;

  /**
   * Update product with optional new image (admin only)
   * Supports partial updates and file replacement
   */
  update(id: string, data: AdminUpdateProductRequest): Promise<Product>;

  /**
   * Soft delete product (admin only)
   */
  delete(id: string): Promise<void>;
}

/**
 * Admin Products Service Implementation
 * Handles multipart/form-data uploads for product images
 */
export class AdminProductsService implements IAdminProductsService {
  /**
   * Build FormData from AdminCreateProductRequest
   * Helper method to reduce code duplication
   */
  private buildCreateFormData(request: AdminCreateProductRequest): FormData {
    const formData = new FormData();

    // Required fields
    formData.append("name", request.name);
    formData.append("priceInt", String(request.priceInt));

    // Optional fields
    this.appendIfDefined(formData, "description", request.description);
    this.appendIfDefined(formData, "categoryId", request.categoryId);
    this.appendIfDefined(formData, "sku", request.sku);
    this.appendIfDefined(formData, "slug", request.slug);
    this.appendIfDefined(formData, "model3dUrl", request.model3dUrl);

    if (request.stock !== undefined) {
      formData.append("stock", String(request.stock));
    }
    if (request.attributes !== undefined && request.attributes !== null) {
      formData.append("attributes", JSON.stringify(request.attributes));
    }

    // File upload (if provided)
    if (request.image !== undefined && request.image !== null) {
      formData.append("image", request.image);
    }

    return formData;
  }

  /**
   * Build FormData from AdminUpdateProductRequest
   * Helper method for partial updates
   */
  private buildUpdateFormData(request: AdminUpdateProductRequest): FormData {
    const formData = new FormData();

    // Only append provided fields (partial update)
    this.appendIfDefined(formData, "name", request.name);
    this.appendIfDefined(formData, "categoryId", request.categoryId);
    this.appendIfDefined(formData, "sku", request.sku);
    this.appendIfDefined(formData, "slug", request.slug);
    this.appendIfDefined(formData, "description", request.description);
    this.appendIfDefined(formData, "model3dUrl", request.model3dUrl);

    if (request.priceInt !== undefined && request.priceInt !== null) {
      formData.append("priceInt", String(request.priceInt));
    }
    if (request.stock !== undefined && request.stock !== null) {
      formData.append("stock", String(request.stock));
    }
    if (request.attributes !== undefined && request.attributes !== null) {
      formData.append("attributes", JSON.stringify(request.attributes));
    }

    // File upload (if provided - replaces old image)
    if (request.image !== undefined && request.image !== null) {
      formData.append("image", request.image);
    }

    return formData;
  }

  /**
   * Helper method to append value to FormData if defined and not null
   */
  private appendIfDefined(
    formData: FormData,
    key: string,
    value: string | undefined | null,
  ): void {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }

  /**
   * List products with filters (admin only)
   */
  async list(
    params?: AdminProductQueryParams,
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (params) {
      const query: AdminProductQueryParams = params;
      if (query.page !== undefined) {
        queryParams.append("page", String(query.page));
      }
      // Backend expects 'pageSize', not 'limit'
      if (query.pageSize !== undefined) {
        queryParams.append("pageSize", String(query.pageSize));
      }
      if (query.search) {
        queryParams.append("search", query.search);
      }
      if (query.categoryId) {
        queryParams.append("categoryId", query.categoryId);
      }
    }

    const query = queryParams.toString();
    const endpoint = query ? `${BASE_URL}?${query}` : BASE_URL;
    return apiGetValidated<PaginatedResponse<Product>>(
      endpoint,
      PaginatedProductsSchema,
    );
  }

  /**
   * Get single product by ID (admin only)
   */
  async getById(id: string): Promise<Product> {
    return apiGetValidated<Product>(
      `${BASE_URL}/${id}`,
      ProductSchema as z.ZodType<Product>,
    );
  }

  /**
   * Create product with multipart form data (admin only)
   * Supports file upload via FormData
   */
  async create(data: AdminCreateProductRequest): Promise<Product> {
    const formData = this.buildCreateFormData(data);

    const response = await apiClient.post<Product>(
      "/products/admin",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    // Validate response với Zod
    return ProductSchema.parse(response.data);
  }

  /**
   * Update product with optional new image (admin only)
   * Supports partial updates and file replacement
   */
  async update(id: string, data: AdminUpdateProductRequest): Promise<Product> {
    const formData = this.buildUpdateFormData(data);

    const response = await apiClient.put<Product>(
      `/products/admin/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    // Validate response với Zod
    return ProductSchema.parse(response.data);
  }

  /**
   * Soft delete product (admin only)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/admin/${id}`);
  }
}

/**
 * Default instance of AdminProductsService
 * Export singleton instance for backward compatibility
 */
export const adminProductsApi = new AdminProductsService();
