/**
 * useARSnapshots Hook
 * Fetches and manages AR snapshots
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { arApi } from "@/features/ar/services/ar.service";
import type { ARSnapshot } from "@/types";

export function useARSnapshots() {
  const [snapshots, setSnapshots] = useState<ARSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await arApi.getAll();
        setSnapshots(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { snapshots, loading, error };
}
