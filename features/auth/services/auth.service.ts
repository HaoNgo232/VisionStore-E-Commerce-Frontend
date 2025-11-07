/**
 * Authentication Service
 * Handles all authentication API calls with runtime validation
 */

import {
  apiPostValidated,
  apiGetValidated,
  getErrorMessage,
} from "@/lib/api-client";
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
import {
  AuthResponseSchema,
  TokenRefreshResponseSchema,
  VerifyTokenResponseSchema,
  UserSchema,
} from "@/types/auth.types";

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiPostValidated<AuthResponse, LoginRequest>(
        "/auth/login",
        AuthResponseSchema,
        credentials,
      );
      // Save tokens to store
      useAuthStore
        .getState()
        .setTokens(response.accessToken, response.refreshToken);
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
      const response = await apiPostValidated<AuthResponse, RegisterRequest>(
        "/auth/register",
        AuthResponseSchema,
        data,
      );
      // Save tokens to store
      useAuthStore
        .getState()
        .setTokens(response.accessToken, response.refreshToken);
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
      const response = await apiPostValidated<
        TokenRefreshResponse,
        TokenRefreshRequest
      >("/auth/refresh", TokenRefreshResponseSchema, { refreshToken });
      // Update tokens in store
      useAuthStore
        .getState()
        .setTokens(response.accessToken, response.refreshToken);
      return response;
    } catch (error) {
      // If refresh fails, clear auth
      useAuthStore.getState().clearTokens();
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify if token is valid
   */
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      return await apiPostValidated<VerifyTokenResponse, Record<string, never>>(
        "/auth/verify",
        VerifyTokenResponseSchema,
        {},
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Note: Backend might use GET /auth/me or POST /auth/me
      // Using POST for now, can be changed to GET if needed
      return await apiPostValidated<User, Record<string, never>>(
        "/auth/me",
        UserSchema,
        {},
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Logout - clear local auth data
   * Note: Backend will invalidate the token
   */
  logout(): void {
    useAuthStore.getState().clearTokens();
  },
};
