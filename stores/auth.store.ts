/**
 * Authentication Store
 * Manages auth tokens and user state using Zustand
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthResponse } from "@/types";

/**
 * Decode JWT token payload
 * JWT format: header.payload.signature
 */
function decodeToken(
  token: string,
): { sub?: string; [key: string]: any } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

interface AuthStore {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  user: User | null;

  // Methods
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setAuth: (payload: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  getUserId: () => string | null;
}

/**
 * Auth store with localStorage persistence
 * Tokens are persisted to localStorage and restored on app load
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      userId: null,
      user: null,

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
       * Set user profile
       */
      setUser: (user: User) => {
        set({ user });
      },

      /**
       * Set complete auth response (login/register)
       * Extracts userId from accessToken JWT
       */
      setAuth: (payload: AuthResponse) => {
        const decoded = decodeToken(payload.accessToken);
        const userId = decoded?.sub || null;
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          userId,
        });
      },

      /**
       * Clear all auth data (logout)
       */
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          user: null,
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
        user: state.user,
      }),
    },
  ),
);
