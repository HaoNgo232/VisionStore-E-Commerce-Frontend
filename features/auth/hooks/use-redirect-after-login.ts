"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

/**
 * useRedirectAfterLogin Hook
 * Redirects user to returnUrl after successful login
 * Used in login/register pages
 */
export function useRedirectAfterLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, router, searchParams]);
}
