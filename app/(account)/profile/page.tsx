"use client"

import { useState, useEffect } from "react"
import type { JSX } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTab } from "@/features/orders/components/orders-tab"
import { AddressesTab } from "@/features/addresses/components/addresses-tab"
import { ProfileTab } from "@/features/users/components/profile-tab"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Package, MapPin, User } from "lucide-react"

type TabValue = "orders" | "addresses" | "profile"

/**
 * Type guard function to validate if a string is a valid TabValue
 */
function isTabValue(value: string | null): value is TabValue {
  return value === "orders" || value === "addresses" || value === "profile"
}

export default function ProfilePage(): JSX.Element {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabValue>("orders")

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (isTabValue(tabParam)) {
      setActiveTab(tabParam)
    } else {
      // Default: orders tab
      setActiveTab("orders")
    }
  }, [searchParams])

  const handleTabChange = (value: string): void => {
    const tabValue: TabValue = isTabValue(value) ? value : "orders"

    if (!isTabValue(value)) {
      // Fallback to orders if invalid value
      console.warn(`Invalid tab value: ${value}, falling back to orders`)
    }

    setActiveTab(tabValue)
    // Update URL without causing navigation
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (tabValue === "orders") {
      newSearchParams.delete("tab")
    } else {
      newSearchParams.set("tab", tabValue)
    }
    router.replace(`/profile?${newSearchParams.toString()}`, { scroll: false })
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tài khoản của tôi</h1>
          <p className="text-muted-foreground mt-2">Quản lý đơn đặt hàng và cài đặt tài khoản của bạn</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              Địa chỉ
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressesTab />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}