/**
 * useUserProfile Hook
 * Fetches and manages user profile
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { usersApi } from "@/features/users/services/users.service";
import type { User } from "@/types";

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
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

    fetch();
  }, []);

  return { user, loading, error };
}
