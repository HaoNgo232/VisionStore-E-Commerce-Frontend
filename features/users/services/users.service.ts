/**
 * Users Service
 * API integration for user management (Admin)
 * Note: User profile endpoints are in auth.service.ts
 */

import { type z } from "zod";
import { apiGetValidated, apiPutValidated } from "@/lib/api-client";
import type {
  User,
  ListUsersResponse,
  UpdateUserRequest,
  UpdateProfileRequest,
} from "@/types";
import { UserSchema, ListUsersResponseSchema } from "@/types";
import type { UserRole } from "@/types/auth.types";

// Local interface for better type inference (avoids TypeScript strict mode false positives)
interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}

/**
 * Interface for Users Service
 * Defines contract for user management operations
 */
export interface IUsersService {
  /**
   * List all users with pagination and filters (Admin only)
   */
  listUsers(query?: ListUsersParams): Promise<ListUsersResponse>;

  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<User>;

  /**
   * Get user by email (Admin only)
   */
  getUserByEmail(email: string): Promise<User>;

  /**
   * Update user profile (for current user)
   */
  updateProfile(userId: string, data: UpdateProfileRequest): Promise<User>;

  /**
   * Update user (Admin only)
   */
  updateUser(userId: string, data: UpdateUserRequest): Promise<User>;

  /**
   * Deactivate user account (Admin only)
   */
  deactivateUser(userId: string): Promise<User>;
}

/**
 * Users Service Implementation
 * Handles user management API operations with runtime validation
 */
export class UsersService implements IUsersService {
  /**
   * List all users with pagination and filters (Admin only)
   */
  async listUsers(query?: ListUsersParams): Promise<ListUsersResponse> {
    const searchParams = new URLSearchParams();

    if (query?.page !== undefined) {
      searchParams.set("page", query.page.toString());
    }
    if (query?.pageSize !== undefined) {
      searchParams.set("pageSize", query.pageSize.toString());
    }
    if (query?.search) {
      searchParams.set("search", query.search);
    }
    if (query?.role) {
      searchParams.set("role", query.role);
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    return apiGetValidated<ListUsersResponse>(
      endpoint,
      ListUsersResponseSchema as z.ZodType<ListUsersResponse>,
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return apiGetValidated<User>(
      `/users/${userId}`,
      UserSchema as z.ZodType<User>,
    );
  }

  /**
   * Get user by email (Admin only)
   */
  async getUserByEmail(email: string): Promise<User> {
    return apiGetValidated<User>(
      `/users/email/${encodeURIComponent(email)}`,
      UserSchema as z.ZodType<User>,
    );
  }

  /**
   * Update user profile (for current user)
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest,
  ): Promise<User> {
    return apiPutValidated<User, UpdateProfileRequest>(
      `/users/${userId}`,
      UserSchema as z.ZodType<User>,
      data,
    );
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return apiPutValidated<User, UpdateUserRequest>(
      `/users/${userId}`,
      UserSchema as z.ZodType<User>,
      data,
    );
  }

  /**
   * Deactivate user account (Admin only)
   */
  async deactivateUser(userId: string): Promise<User> {
    return apiPutValidated<User, Record<string, never>>(
      `/users/${userId}/deactivate`,
      UserSchema as z.ZodType<User>,
      {},
    );
  }
}

/**
 * Default instance of UsersService
 * Export singleton instance for backward compatibility
 */
export const usersApi = new UsersService();
