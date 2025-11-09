/**
 * Users List React Query Hook
 * Fetches paginated users list with search and filters
 */

"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { usersApi } from "../services/users.service";
import { queryKeys } from "@/lib/query-keys";
import type { ListUsersQuery, ListUsersResponse } from "@/types";

/**
 * Get paginated users list with search and filters
 * Note: Search debouncing should be handled at component level
 */
export function useUsersList(
  query?: ListUsersQuery,
): UseQueryResult<ListUsersResponse, Error> {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => usersApi.listUsers(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

