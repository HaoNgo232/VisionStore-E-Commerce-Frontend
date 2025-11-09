/**
 * useUserProfile Hook
 * Fetches and manages user profile using React Query
 */

"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types";

export function useUserProfile(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
