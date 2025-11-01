/**
 * Authentication Types
 * Types for login, register, token refresh, etc.
 */

export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

/**
 * Authentication response with tokens
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh request
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Verify token response
 */
export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
  expiresIn?: number;
}
