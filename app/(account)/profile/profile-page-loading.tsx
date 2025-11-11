import type { JSX } from "react"

/**
 * Loading fallback component for Suspense boundary in ProfilePage
 */
export function ProfilePageLoading(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tài khoản của tôi</h1>
        <p className="text-muted-foreground mt-2">Quản lý đơn đặt hàng và cài đặt tài khoản của bạn</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    </div>
  )
}

