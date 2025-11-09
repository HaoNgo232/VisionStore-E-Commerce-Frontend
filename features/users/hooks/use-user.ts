/**
 * Single User React Query Hook
 * Fetches user by ID or email
 */

"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { usersApi } from "../services/users.service";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types";

/**
 * Get single user by ID
 */
export function useUser(userId: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single user by email (Admin only)
 */
export function useUserByEmail(email: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: queryKeys.users.byEmail(email),
    queryFn: () => usersApi.getUserByEmail(email),
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

