"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * ProtectedRoute Component
 * Ensures user is authenticated before rendering children
 * Redirects to login page if not authenticated
 */
export function ProtectedRoute({
    children,
    redirectTo = "/auth/login",
}: ProtectedRouteProps) {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Small delay để ensure auth state được hydrated
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                // Save current path để redirect sau khi login
                const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
                const returnUrl = currentPath ? `?returnUrl=${encodeURIComponent(currentPath)}` : ""
                router.push(`${redirectTo}${returnUrl}`)
            } else {
                setIsChecking(false)
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [isAuthenticated, router, redirectTo])

    // Show nothing while checking authentication
    if (isChecking || !isAuthenticated) {
        return null
    }

    return <>{children}</>
}
