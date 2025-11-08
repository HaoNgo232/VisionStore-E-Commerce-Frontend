/**
 * Common Types
 * Shared types used across the application
 */

import { z } from "zod";

/**
 * Helper schema for CUID (Collision-resistant Unique Identifier)
 * Backend uses CUID format (e.g., "cmhozukjp000z...") instead of UUID
 * All models in backend use @default(cuid()) in Prisma schema
 */
export const cuidSchema = () => z.string().min(10); // CUIDs are typically 25+ chars, but we'll be lenient

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
): z.ZodObject<{
  products: z.ZodArray<T>;
  total: z.ZodNumber;
  page: z.ZodNumber;
  pageSize: z.ZodNumber;
  totalPages: z.ZodNumber;
}> {
  return z.object({
    products: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().nonnegative(), // Backend should always return page number
    pageSize: z.number().int().nonnegative(), // Backend should always return pageSize
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
