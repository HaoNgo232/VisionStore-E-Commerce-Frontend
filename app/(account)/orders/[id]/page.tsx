"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"
import { ordersApi } from "@/features/orders/services/orders.service"
import { formatPrice } from "@/features/products/utils"
import { toast } from "sonner"
import type { Order, Address } from "@/types"
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge"
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge"
import { usersApi } from "@/features/users/services/users.service"

export default function OrderDetailPage(): JSX.Element {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string

    const [order, setOrder] = useState<Order | null>(null)
    const [address, setAddress] = useState<Address | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError("Order ID not found")
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const fetchedOrder = await ordersApi.getById(orderId)
                setOrder(fetchedOrder)

                // Lấy thông tin địa chỉ nếu có addressId
                if (fetchedOrder.addressId) {
                    try {
                        const fetchedAddress = await usersApi.getAddressById(fetchedOrder.addressId)
                        setAddress(fetchedAddress)
                    } catch (addressErr) {
                        console.warn("Không thể tải thông tin địa chỉ:", addressErr)
                        // Không dừng loading nếu lấy địa chỉ thất bại
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng"
                console.error("Error fetching order:", err)
                setError(errorMessage)
                toast.error(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        void fetchOrder();
    }, [orderId])

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="container py-12 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
                        <p className="text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (error || !order) {
        return (
            <ProtectedRoute>
                <div className="container py-12">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">{error ?? "Không tìm thấy đơn hàng"}</p>
                        <Button onClick={() => router.back()}>Quay lại</Button>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div>
                {/* Breadcrumb */}
                <div className="border-b">
                    <div className="container py-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/profile">Tài khoản</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/profile#orders">Đơn hàng</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Chi tiết đơn hàng</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                <div className="container py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
                                <p className="text-muted-foreground">Mã: {order.id}</p>
                            </div>
                        </div>

                        {/* Order Status Section */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Trạng thái đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <OrderStatusBadge status={order.status} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Trạng thái thanh toán</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PaymentStatusBadge status={order.paymentStatus} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Thông tin đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                                        <p className="font-mono font-semibold">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ngày đặt</p>
                                        <p className="font-semibold">
                                            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                                        <p className="font-semibold">
                                            {new Date(order.updatedAt).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tổng tiền</p>
                                        <p className="font-semibold text-lg">{formatPrice(order.totalInt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products */}
                        {order.items && order.items.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Sản phẩm ({order.items.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                                {item.imageUrls?.[0] && (
                                                    <img
                                                        src={item.imageUrls[0]}
                                                        alt={item.productName || "Sản phẩm"}
                                                        className="h-20 w-20 rounded object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productName || "Sản phẩm"}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Số lượng: {item.quantity}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Giá: {formatPrice(item.priceInt || 0)}/cái
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {formatPrice((item.priceInt || 0) * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Shipping Address */}
                        {address ? (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Họ tên</p>
                                        <p className="font-semibold">{address.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                        <p className="font-semibold">{address.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                        <p className="font-semibold">
                                            {address.street}, {address.ward}, {address.district}, {address.city}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : order.addressId ? (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Không thể tải thông tin địa chỉ (ID: {order.addressId})
                                    </p>
                                </CardContent>
                            </Card>
                        ) : null}

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tổng tiền hàng</span>
                                    <span className="font-medium">{formatPrice(order.totalInt || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phí vận chuyển</span>
                                    <span className="font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice(order.totalInt || 0)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <Button variant="outline" onClick={() => router.back()}>
                                Quay lại
                            </Button>
                            <Button onClick={() => router.push("/profile#orders")}>
                                Xem tất cả đơn hàng
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}