/**
 * Common Types
 * Shared types used across the application
 */

import { z } from "zod";

/**
 * Standard API error response from backend
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Zod schema for ApiError
 */
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
});

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Zod schema factory for PaginatedResponse
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
) {
  return z.object({
    products: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
}

/**
 * Standard API success response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Generic response with metadata
 */
export interface ApiResponseWithMeta<T> {
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

/**
 * Async operation state
 */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: ApiError };

/**
 * Create an API error object
 */
export function createApiError(code: string, message: string): ApiError {
  return {
    statusCode: 500,
    message,
    error: code,
  };
}
