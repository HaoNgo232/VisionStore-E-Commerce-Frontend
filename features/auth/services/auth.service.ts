/**
 * Authentication Service
 * Handles all authentication API calls
 */

import { apiPost, getErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  VerifyTokenResponse,
  User,
} from "@/types";

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>("/auth/login", credentials);
      // Auto-save tokens and user to store
      useAuthStore.getState().setAuth(response);
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register new account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>("/auth/register", data);
      // Auto-save tokens and user to store
      useAuthStore.getState().setAuth(response);
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await apiPost<TokenRefreshResponse>("/auth/refresh", {
        refreshToken,
      });
      // Update tokens in store
      useAuthStore
        .getState()
        .setTokens(response.accessToken, response.refreshToken);
      return response;
    } catch (error) {
      // If refresh fails, clear auth
      useAuthStore.getState().clearAuth();
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify if token is valid
   */
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await apiPost<VerifyTokenResponse>("/auth/verify", {});
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiPost<User>("/auth/me", {});
      // Update user in store
      useAuthStore.getState().setUser(response);
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Logout - clear local auth data
   * Note: Backend will invalidate the token
   */
  logout(): void {
    useAuthStore.getState().clearAuth();
  },
};
