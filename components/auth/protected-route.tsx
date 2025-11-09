"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useAuthStore } from "@/stores/auth.store"
import { UserRole } from "@/types/auth.types"

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
    requiredRole?: UserRole | UserRole[]
}

/**
 * ProtectedRoute Component
 * Ensures user is authenticated before rendering children
 * Optionally checks for required role(s)
 * Redirects to login page if not authenticated
 * Redirects to /unauthorized if role check fails
 */
export function ProtectedRoute({
    children,
    redirectTo = "/auth/login",
    requiredRole,
}: ProtectedRouteProps): React.ReactElement | null {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const getUserRole = useAuthStore((state) => state.getUserRole)
    const [isChecking, setIsChecking] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)

    useEffect(() => {
        // Small delay để ensure auth state được hydrated
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                // Save current path để redirect sau khi login
                const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
                const returnUrl = currentPath ? `?returnUrl=${encodeURIComponent(currentPath)}` : ""
                router.push(`${redirectTo}${returnUrl}`)
                return
            }

            // Check role if required
            if (requiredRole) {
                const userRole = getUserRole()
                if (!userRole) {
                    router.push("/unauthorized")
                    return
                }

                // Check if user has required role
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
                const hasRequiredRole = roles.some(
                    (role) => role.toUpperCase() === userRole.toUpperCase()
                )

                if (!hasRequiredRole) {
                    router.push("/unauthorized")
                    return
                }

                setHasAccess(true)
            } else {
                setHasAccess(true)
            }

            setIsChecking(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [isAuthenticated, router, redirectTo, requiredRole, getUserRole])

    // Show nothing while checking authentication
    if (isChecking || !isAuthenticated || !hasAccess) {
        return null
    }

    return <>{children}</>
}
