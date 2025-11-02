/**
 * Common Types
 * Shared types used across the application
 */

/**
 * Standard API error response from backend
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

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
