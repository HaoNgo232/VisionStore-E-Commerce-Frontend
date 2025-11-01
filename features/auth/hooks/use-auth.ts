/**
 * useAuth Hook
 * Provides access to auth state and methods
 */

"use client";

import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const { accessToken, user, isAuthenticated, clearAuth } = useAuthStore();

  return {
    /** Access token for API calls */
    accessToken,
    /** Current user object or null */
    user,
    /** Check if user is authenticated */
    isAuthenticated: isAuthenticated(),
    /** Logout method */
    logout: clearAuth,
  };
}
