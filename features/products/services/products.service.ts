/**
 * Products Service
 * API integration for product catalog with runtime validation
 * Falls back to mock data when API is unavailable (Dev/PoC Mode)
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
import { mockProducts } from "@/lib/data";

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

/**
 * Interface for Products Service
 * Defines contract for product catalog operations
 */
export interface IProductsService {
  getAll(params?: GetProductsParams): Promise<PaginatedResponse<Product>>;
  getById(productId: string): Promise<Product>;
  create(data: CreateProductRequest): Promise<Product>;
  getBySlug(slug: string): Promise<Product>;
  update(productId: string, data: UpdateProductRequest): Promise<Product>;
  delete(productId: string): Promise<void>;
}

/**
 * Products Service Implementation
 * Handles product catalog API operations with fallback to mock data
 */
export class ProductsService implements IProductsService {
  /**
   * Get all products with optional filters
   */
  async getAll(
    params?: GetProductsParams,
  ): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", String(params.page));
      if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));
      if (params?.categorySlug) queryParams.append("categorySlug", params.categorySlug);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.minPriceInt) queryParams.append("minPriceInt", String(params.minPriceInt));
      if (params?.maxPriceInt) queryParams.append("maxPriceInt", String(params.maxPriceInt));

      const query = queryParams.toString();
      const endpoint = query ? `/products?${query}` : "/products";
      return await apiGetValidated<PaginatedResponse<Product>>(
        endpoint,
        PaginatedProductsSchema,
      );
    } catch (error) {
      console.warn("API unavailable, falling back to mock data", error);
      
      const categorySlug = params?.categorySlug;
      const filteredProducts = categorySlug 
        ? mockProducts.filter(p => p.slug.includes(categorySlug))
        : mockProducts;

      return {
        products: filteredProducts,
        total: filteredProducts.length,
        pageSize: params?.pageSize || 10,
        totalPages: 1,
        page: params?.page || 1,
      };
    }
  }

  /**
   * Get product by ID
   */
  async getById(productId: string): Promise<Product> {
    try {
      return await apiGetValidated<Product>(
        `/products/${productId}`,
        ProductSchema as z.ZodType<Product>,
      );
    } catch (error) {
      const product = mockProducts.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");
      return product;
    }
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<Product> {
    try {
      return await apiGetValidated<Product>(
        `/products/slug/${slug}`,
        ProductSchema as z.ZodType<Product>,
      );
    } catch (error) {
      const product = mockProducts.find(p => p.slug === slug);
      if (!product) throw new Error("Product not found");
      return product;
    }
  }

  /**
   * Create new product (Mock implementation)
   */
  async create(data: CreateProductRequest): Promise<Product> {
    try {
      return await apiPostValidated<Product, CreateProductRequest>(
        "/products",
        ProductSchema as z.ZodType<Product>,
        data,
      );
    } catch (error) {
      console.warn("API unavailable, simulating create");
      return {
        ...data,
        id: `cmh${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: data.description || null,
        categoryId: data.categoryId || null,
        attributes: (data.attributes as any) || null,
        model3dUrl: data.model3dUrl || null,
      } as Product;
    }
  }

  /**
   * Update product (Mock implementation)
   */
  async update(
    productId: string,
    data: UpdateProductRequest,
  ): Promise<Product> {
    try {
      return await apiPatchValidated<Product, UpdateProductRequest>(
        `/products/${productId}`,
        ProductSchema as z.ZodType<Product>,
        data,
      );
    } catch (error) {
      console.warn("API unavailable, simulating update");
      const product = mockProducts.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");
      return { ...product, ...data } as Product;
    }
  }

  /**
   * Delete product (Mock implementation)
   */
  async delete(productId: string): Promise<void> {
    try {
      await apiDelete<void>(`/products/${productId}`);
    } catch (error) {
      console.warn("API unavailable, simulating delete");
    }
  }
}

/**
 * Default instance of ProductsService
 */
export const productsApi = new ProductsService();
