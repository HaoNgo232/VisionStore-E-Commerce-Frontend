/**
 * Auth React Query Hooks
 * Hooks for authentication with React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import type { LoginRequest, RegisterRequest, User } from "@/types";

/**
 * Get current authenticated user
 */
export function useCurrentUser(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
    enabled: typeof window !== "undefined", // Only run on client
  });
}

/**
 * Login mutation
 */
export function useLogin(): UseMutationResult<User, Error, LoginRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      // Invalidate and refetch current user
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.currentUser(),
      });
    },
  });
}

/**
 * Register mutation
 */
export function useRegister(): UseMutationResult<User, Error, RegisterRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.currentUser(),
      });
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout(): UseMutationResult<void, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}

/**
 * Verify token mutation
 */
export function useVerifyToken(): UseMutationResult<boolean, Error, void, unknown> {
  return useMutation({
    mutationFn: () => authService.verifyToken(),
  });
}
