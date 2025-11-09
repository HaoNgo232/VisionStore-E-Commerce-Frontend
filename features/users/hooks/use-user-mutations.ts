/**
 * User Mutations React Query Hooks
 * Mutations for updating and deactivating users
 */

"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { usersApi } from "../services/users.service";
import { queryKeys } from "@/lib/query-keys";
import type { User, UpdateUserRequest } from "@/types";
import { toast } from "sonner";

/**
 * Update user mutation (Admin only)
 */
export function useUpdateUser(): UseMutationResult<
  User,
  Error,
  { userId: string; data: UpdateUserRequest },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      usersApi.updateUser(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific user and list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
}

/**
 * Deactivate user mutation (Admin only)
 */
export function useDeactivateUser(): UseMutationResult<
  User,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deactivateUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate specific user and list
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      toast.success("User deactivated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate user: ${error.message}`);
    },
  });
}

