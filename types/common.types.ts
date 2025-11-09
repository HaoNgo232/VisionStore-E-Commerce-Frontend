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
export const cuidSchema = (): z.ZodString => z.string().min(10); // CUIDs are typically 25+ chars, but we'll be lenient

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

/**
 * Preprocess function for imageUrls array
 * Handles null, undefined, or invalid values and ensures type safety
 */
export function preprocessImageUrls(val: unknown): string[] {
  if (val === null || val === undefined) {
    return [];
  }
  if (Array.isArray(val)) {
    return val as string[];
  }
  return [];
}

/**
 * Preprocess function for date strings
 * Converts Date objects to ISO strings, handles string dates, and safely converts other types
 */
export function preprocessDateString(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "string") {
    return val;
  }
  // Only convert primitive types to string
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  // For objects or other types, return empty string as fallback
  return "";
}

/**
 * Preprocess function for nullable CUID strings
 * Handles null, undefined, empty strings, and safely converts to string
 */
export function preprocessNullableCuid(val: unknown): string | null {
  if (val === null || val === undefined || val === "") {
    return null;
  }
  if (typeof val === "string") {
    return val;
  }
  // Only convert primitive types to string
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  // For objects, return null instead of unsafe stringification
  return null;
}
