/**
 * User Types
 * User profile and related types
 */

import type { User } from "./auth.types";

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
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}
