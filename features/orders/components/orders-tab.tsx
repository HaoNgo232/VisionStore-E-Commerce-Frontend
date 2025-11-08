"use client"

import { useRouter } from "next/navigation"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChevronRight, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/features/products/utils"
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge"
import type { OrderStatus } from "@/types"

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: { label: "Chờ xử lý", variant: "secondary" },
    PROCESSING: { label: "Đang xử lý", variant: "default" },
    SHIPPED: { label: "Đang giao", variant: "default" },
    DELIVERED: { label: "Đã giao", variant: "default" },
    CANCELLED: { label: "Đã hủy", variant: "destructive" },
}

export function OrdersTab() {
    const router = useRouter()
    const { orders, loading, error, total } = useOrders()

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <p className="text-red-700">Lỗi khi tải danh sách đơn hàng: {error}</p>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Đơn hàng của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2 font-medium">Bạn chưa có đơn hàng nào</p>
                    <p className="text-sm text-muted-foreground mb-4">Bắt đầu mua sắm để xem đơn hàng của bạn tại đây</p>
                    <Button asChild variant="outline">
                        <a href="/products">Tiếp tục mua sắm</a>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đơn hàng của tôi</CardTitle>
                <CardDescription>Xem và theo dõi {total} đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã đơn hàng</TableHead>
                                <TableHead>Ngày đặt</TableHead>
                                <TableHead className="text-center">Sản phẩm</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                                <TableHead className="text-center">Trạng thái đơn</TableHead>
                                <TableHead className="text-center">Thanh toán</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/50">
                                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell className="text-center">{order.items?.length ?? 0}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatPrice(order.totalInt)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={ORDER_STATUS_CONFIG[order.status].variant}>
                                            {ORDER_STATUS_CONFIG[order.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => void router.push(`/orders/${order.id}`)}
                                            className="gap-1"
                                        >
                                            Chi tiết
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}