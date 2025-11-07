/**
 * useAuth Hook
 * Provides access to auth state and methods
 */

"use client";

import { useAuthStore } from "@/stores/auth.store";

export function useAuth(): {
  accessToken: string | null;
  isAuthenticated: boolean;
  logout: () => void;
} {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const clearTokens = useAuthStore((state) => state.clearTokens);

  return {
    /** Access token for API calls */
    accessToken,
    /** Check if user is authenticated */
    isAuthenticated,
    /** Logout method */
    logout: clearTokens,
  };
}
