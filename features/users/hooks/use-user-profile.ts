/**
 * useUserProfile Hook
 * Fetches and manages user profile
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { usersApi } from "@/features/users/services/users.service";
import type { User } from "@/types";

export function useUserProfile(): {
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
        const data = await usersApi.getProfile();
        setUser(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { user, loading, error };
}
