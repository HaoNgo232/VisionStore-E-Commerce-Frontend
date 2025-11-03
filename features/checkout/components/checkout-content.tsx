"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/features/cart/hooks/use-cart"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ordersApi } from "@/features/orders/services/orders.service"
import { paymentsApi } from "@/features/payments/services/payments.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { PaymentMethod, Order, PaymentStatus } from "@/types"
import { PaymentWaitingDialog } from "@/features/payments/components/payment-waiting-dialog"
import { PaymentSuccessDialog } from "@/features/payments/components/payment-success-dialog"

export function CheckoutContent() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { cart, loading: cartLoading, clearCart } = useCart()
    const { addresses, loading: addressesLoading } = useAddresses()
    const [selectedAddressId, setSelectedAddressId] = useState<string>("")
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.COD)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dialog states for payment flow separation
    const [waitingDialogOpen, setWaitingDialogOpen] = useState(false)
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
    const [paymentId, setPaymentId] = useState<string>("")
    const [createdOrderId, setCreatedOrderId] = useState<string>("")

    // Check if user logged in - use isAuthenticated instead of checking !user
    if (!isAuthenticated) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1>
                <p className="text-muted-foreground mt-2">Bạn cần đăng nhập để thanh toán</p>
                <Link href="/auth/login" className="text-primary hover:underline mt-4 inline-block">
                    Đăng nhập ngay
                </Link>
            </div>
        )
    }

    // Check if cart is empty
    if (!cartLoading && (!cart || cart.items.length === 0)) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
                <p className="text-muted-foreground mt-2">Không có sản phẩm để thanh toán</p>
                <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                    Quay lại mua sắm
                </Link>
            </div>
        )
    }

    // Check if has address
    if (!addressesLoading && addresses.length === 0) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Chưa có địa chỉ</h1>
                <p className="text-muted-foreground mt-2">Vui lòng thêm địa chỉ giao hàng trước</p>
                <Link href="/profile#addresses" className="text-primary hover:underline mt-4 inline-block">
                    Quản lý địa chỉ
                </Link>
            </div>
        )
    }

    if (!selectedAddressId && addresses.length > 0) {
        setSelectedAddressId(addresses[0].id)
    }

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            toast.error("Vui lòng chọn địa chỉ giao hàng")
            return
        }

        if (!cart) {
            toast.error("Giỏ hàng không tìm thấy")
            return
        }

        setIsSubmitting(true)
        try {
            // Create order with cart items
            const order = await ordersApi.create({
                addressId: selectedAddressId,
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceInt: item.product?.priceInt || 0,
                })),
            })

            toast.success("Đặt hàng thành công!")

            // Branch based on payment method
            if (selectedPayment === PaymentMethod.COD) {
                // COD flow: redirect to success page
                router.push(`/cart/success?orderId=${order.id}&paymentMethod=${selectedPayment}`)
            } else if (selectedPayment === PaymentMethod.SEPAY) {
                // SePay flow: process payment to get QR, then open waiting dialog
                setCreatedOrderId(order.id)
                const payment = await paymentsApi.process(order.id, PaymentMethod.SEPAY, cart.totalInt)
                setPaymentId(payment.paymentId)
                setQrCodeUrl(payment.qrCode || "")
                setWaitingDialogOpen(true)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Đặt hàng thất bại"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Dialog handlers for payment flow separation
    const handlePaymentSuccess = async (order: Order) => {
        setWaitingDialogOpen(false)
        setCompletedOrder(order)
        setSuccessDialogOpen(true)

        // Clear cart after successful payment
        try {
            await clearCart()
        } catch (e) {
            // Swallow non-critical cart clear errors
        }
    }

    const handlePaymentTimeout = () => {
        setWaitingDialogOpen(false)
        toast.error("Thanh toán hết thời gian. Vui lòng thử lại.")
    }

    const handlePaymentError = (error: string) => {
        setWaitingDialogOpen(false)
        toast.error(error)
    }

    const handleViewOrder = (orderId: string) => {
        router.push(`/orders/${orderId}`)
    }

    if (cartLoading || addressesLoading) {
        return <div className="container py-8">Đang tải...</div>
    }

    const total = cart ? cart.totalInt : 0

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Địa chỉ giao hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                                            <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                                                <div className="font-semibold">{address.fullName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {address.street}, {address.ward}, {address.district}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {address.city} • {address.phone}
                                                </div>
                                                {address.isDefault && (
                                                    <div className="text-xs text-primary font-medium mt-1">Địa chỉ mặc định</div>
                                                )}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                            <Link
                                href="/profile#addresses"
                                className="text-primary hover:underline text-sm mt-4 inline-block"
                            >
                                Quản lý địa chỉ
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Phương thức thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedPayment} onValueChange={(value) => setSelectedPayment(value as PaymentMethod)}>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value={PaymentMethod.COD} id="cod" />
                                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                            <div className="font-semibold">Thanh toán khi nhận hàng (COD)</div>
                                            <div className="text-sm text-muted-foreground">
                                                Thanh toán tiền mặt khi nhân viên giao hàng tới
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value={PaymentMethod.SEPAY} id="sepay" />
                                        <Label htmlFor="sepay" className="flex-1 cursor-pointer">
                                            <div className="font-semibold">Chuyển khoản ngân hàng (SePay)</div>
                                            <div className="text-sm text-muted-foreground">
                                                Quét mã QR để thanh toán qua ngân hàng
                                            </div>
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {cart?.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.product?.imageUrls[0] || "/placeholder.svg"}
                                                alt={item.product?.name}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">{item.product?.name}</p>
                                                <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">
                                            {((item.product?.priceInt || 0) / item.quantity).toLocaleString("vi-VN")}₫
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div>
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Tóm tắt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tạm tính</span>
                                <span className="font-medium">{total.toLocaleString("vi-VN")}₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vận chuyển</span>
                                <span className="font-medium">Miễn phí</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-lg">
                                <span className="font-semibold">Tổng cộng</span>
                                <span className="font-bold">{total.toLocaleString("vi-VN")}₫</span>
                            </div>

                            <Button
                                className="w-full mt-6"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isSubmitting || !selectedAddressId}
                            >
                                {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                            </Button>

                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/cart">Quay lại giỏ hàng</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Waiting Dialog */}
            <PaymentWaitingDialog
                open={waitingDialogOpen}
                onOpenChange={setWaitingDialogOpen}
                orderId={createdOrderId}
                payment={{
                    paymentId: paymentId,
                    status: PaymentStatus.UNPAID,
                    qrCode: qrCodeUrl,
                }}
                amountInt={cart?.totalInt || 0}
                onSuccess={handlePaymentSuccess}
                onTimeout={handlePaymentTimeout}
                onError={handlePaymentError}
            />

            {/* Payment Success Dialog */}
            {completedOrder && (
                <PaymentSuccessDialog
                    open={successDialogOpen}
                    onClose={() => setSuccessDialogOpen(false)}
                    order={completedOrder}
                    onViewOrder={handleViewOrder}
                />
            )}
        </div>
    )
}
