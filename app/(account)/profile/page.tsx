"use client"

import { Suspense } from "react"
import type { JSX } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfilePageContent } from "./profile-page-content"
import { ProfilePageLoading } from "./profile-page-loading"

export default function ProfilePage(): JSX.Element {
  return (
    <ProtectedRoute>
      <Suspense fallback={<ProfilePageLoading />}>
        <ProfilePageContent />
      </Suspense>
    </ProtectedRoute>
  )
}