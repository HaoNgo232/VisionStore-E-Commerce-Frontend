/**
 * API Client - Axios-based HTTP client for backend communication
 *
 * Features:
 * - Request/response interceptors for auth token management
 * - Automatic token refresh on 401
 * - Error handling and transformation
 * - Retry logic for failed requests
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiError } from "@/types/common.types";

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor - Add auth header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor - Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 - Token might be expired, try refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          // No refresh token - logout user
          useAuthStore.getState().clearAuth();
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            timeout: API_CONFIG.TIMEOUT,
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in store
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Update auth header with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().clearAuth();

        // Redirect to login (client-side only)
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Transform axios error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, showToast = false): string {
  const message = getErrorMessage(error);

  if (showToast && typeof window !== "undefined") {
    // Will integrate with toast notification library later
    console.error("[API Error]", message);
  }

  return message;
}

/**
 * Helper for GET requests
 */
export async function apiGet<T>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(endpoint, config);
  return response.data;
}

/**
 * Helper for POST requests
 */
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(endpoint, data, config);
  return response.data;
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(endpoint, data, config);
  return response.data;
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(endpoint, data, config);
  return response.data;
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(endpoint, config);
  return response.data;
}
