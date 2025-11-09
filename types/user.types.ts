/**
 * User Types
 * User profile and related types
 */

import { z } from "zod";
import type { User, UserRole } from "./auth.types";
import { UserRoleSchema, UserSchema } from "./auth.types";

/**
 * Re-export User as UserProfile for backward compatibility
 * But prefer using User directly
 */
export type UserProfile = User;

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

/**
 * Zod schema for UpdateProfileRequest
 */
export const UpdateProfileRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  phone: z.string().optional(),
});

/**
 * Update user request (Admin)
 */
export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Zod schema for UpdateUserRequest
 */
export const UpdateUserRequestSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: UserRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserRequestInput = z.input<typeof UpdateUserRequestSchema>;
export type UpdateUserRequestOutput = z.output<typeof UpdateUserRequestSchema>;

/**
 * List users query parameters
 */
export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}

/**
 * Zod schema for ListUsersQuery
 */
export const ListUsersQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  search: z.string().optional(),
  role: UserRoleSchema.optional(),
});

/**
 * List users response
 */
export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Zod schema for ListUsersResponse
 */
export const ListUsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
