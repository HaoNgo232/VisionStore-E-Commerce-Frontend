"use client"

import { useOrders } from "@/features/orders/hooks/use-orders"
import { OrderCard } from "./order-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

export function OrdersTab() {
    const userId = "user-1" // TODO: Get from auth context
    const { orders, loading } = useOrders(userId)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Start shopping to see your orders here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}