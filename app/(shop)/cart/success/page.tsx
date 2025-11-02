"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CheckCircle } from "lucide-react"
import { ordersApi } from "@/features/orders/services/orders.service"
import { useCartStore } from "@/stores/cart.store"
import { toast } from "sonner"
import type { Order } from "@/types"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()

  const orderId = searchParams.get("orderId")
  const paymentMethod = searchParams.get("paymentMethod")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        router.push("/cart")
        return
      }

      try {
        setLoading(true)
        const fetchedOrder = await ordersApi.getById(orderId)
        setOrder(fetchedOrder)
        clearCart()
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error)
        toast.error("Không thể tải chi tiết đơn hàng")
        router.push("/cart")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router, clearCart])

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy đơn hàng</p>
          <Button onClick={() => router.push("/products")}>Tiếp tục mua sắm</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b">
        <div className="container py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Đơn hàng thành công</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Đơn hàng thành công!</h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
            </p>
          </div>

          {/* Order Details */}
          <div className="grid gap-6 mb-8">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-mono font-semibold">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày đặt</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <p className="font-semibold capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                    <p className="font-semibold">
                      {paymentMethod === "COD" ? "Thanh toán khi nhận" : "Chuyển khoản"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || "Product"}
                            className="h-16 w-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name || "Sản phẩm"}</p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {((item.priceInt || 0) / 100).toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order.addressId && (
              <Card>
                <CardHeader>
                  <CardTitle>Địa chỉ giao hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mã địa chỉ: {order.addressId}</p>
                    <p className="text-sm text-muted-foreground">
                      Chi tiết địa chỉ sẽ được hiển thị trong email xác nhận
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền hàng</span>
                  <span>
                    {((order.totalInt || 0) / 100).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span>
                    {((order.totalInt || 0) / 100).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/products")}>
              Tiếp tục mua sắm
            </Button>
            <Button onClick={() => router.push("/profile#orders")}>Xem đơn hàng của tôi</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
