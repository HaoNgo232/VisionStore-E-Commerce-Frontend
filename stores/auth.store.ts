/**
 * Authentication Store
 * Manages auth tokens and user state using Zustand
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthResponse } from "@/types";

interface AuthStore {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  // Methods
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setAuth: (payload: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
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
      user: null,

      /**
       * Set tokens (called after login or token refresh)
       */
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      /**
       * Set user profile
       */
      setUser: (user: User) => {
        set({ user });
      },

      /**
       * Set complete auth response (login/register)
       */
      setAuth: (payload: AuthResponse) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
        });
      },

      /**
       * Clear all auth data (logout)
       */
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
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
    }),
    {
      name: "auth-store", // Key for localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
