/**
 * Authentication Store
 * Manages auth tokens only - user data comes from React Query
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * JWT Payload interface
 */
interface JWTPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  iat?: number;
  exp?: number;
  [key: string]: unknown; // Allow additional claims
}

/**
 * Decode JWT token payload
 * JWT format: header.payload.signature
 */
function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload)) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

interface AuthStore {
  // State - only tokens, user data from React Query
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;

  // Methods
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  getUserId: () => string | null;
}

/**
 * Auth store with localStorage persistence
 * Tokens are persisted to localStorage and restored on app load
 * Note: User data is managed by React Query, not Zustand
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      userId: null,

      /**
       * Set tokens (called after login or token refresh)
       * Automatically extracts userId from JWT
       */
      setTokens: (accessToken: string, refreshToken: string) => {
        const payload = decodeToken(accessToken);
        const userId = payload?.sub || null;
        set({ accessToken, refreshToken, userId });
      },

      /**
       * Clear all auth data (logout)
       */
      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
        });
      },

      /**
       * Check if user is authenticated
       */
      isAuthenticated: () => {
        const { accessToken } = get();
        return !!accessToken;
      },

      /**
       * Get userId from token (or return cached userId)
       */
      getUserId: () => {
        const { userId, accessToken } = get();
        if (userId) return userId;
        if (accessToken) {
          const payload = decodeToken(accessToken);
          return payload?.sub || null;
        }
        return null;
      },
    }),
    {
      name: "auth-store", // Key for localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    },
  ),
);
