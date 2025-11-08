/**
 * Authentication Types
 * Types for login, register, token refresh, etc.

 */

import { z } from "zod";
import { cuidSchema } from "./common.types";

export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

/**
 * Zod schema for UserRole enum
 */
export const UserRoleSchema = z.nativeEnum(UserRole);

/**
 * User response
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Zod schema for User
 */
export const UserSchema = z.object({
  id: cuidSchema(), // Backend uses CUID, not UUID
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    return String(val);
  }, z.string()),
  updatedAt: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    return String(val);
  }, z.string()),
});

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
 * Zod schema for AuthResponse
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

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
 * Zod schema for TokenRefreshResponse
 */
export const TokenRefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

/**
 * Verify token response
 */
export interface VerifyTokenResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  role?: string;
}

/**
 * Zod schema for VerifyTokenResponse
 */
export const VerifyTokenResponseSchema = z.object({
  valid: z.boolean(),
  userId: cuidSchema().optional(), // Backend uses CUID, not UUID
  email: z.string().email().optional(),
  role: z.string().optional(),
}) as z.ZodType<VerifyTokenResponse>;
