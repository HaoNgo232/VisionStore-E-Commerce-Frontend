/**
 * useUpdateProfile Hook
 * Mutation hook for updating user profile
 */

"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { usersApi } from "../services/users.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import type { User, UpdateProfileRequest } from "@/types";
import { toast } from "sonner";

export function useUpdateProfile(): UseMutationResult<
  User,
  Error,
  UpdateProfileRequest,
  unknown
> {
  const queryClient = useQueryClient();
  const getUserId = useAuthStore((state) => state.getUserId);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => {
      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found");
      }
      return usersApi.updateProfile(userId, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.currentUser(),
      });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

