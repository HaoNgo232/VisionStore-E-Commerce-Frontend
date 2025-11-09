/**
 * useCurrentUser Hook
 * Fetches and manages current user profile
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { authService } from "@/features/auth/services/auth.service";
import type { User } from "@/types";

export function useCurrentUser(): {
  user: User | null;
  loading: boolean;
  error: string | null;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(getErrorMessage(err));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { user, loading, error };
}
