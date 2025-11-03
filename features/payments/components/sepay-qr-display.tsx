"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, Copy, RotateCw } from "lucide-react"
import { toast } from "sonner"
import { usePaymentStatus } from "@/features/payments/hooks/use-payment-status"
import { formatPrice } from "@/features/products/utils"
import type { PaymentProcessResponse } from "@/types"

interface SepayQRDisplayProps {
    orderId: string
    payment: PaymentProcessResponse
    amountInt: number
    onPaymentSuccess?: () => void
}

/**
 * SePay QR Code Display Component
 * Displays QR code for bank transfer and polls for payment status
 *
 * Features:
 * - Shows QR code image with countdown timer
 * - Displays payment details (amount, order ID)
 * - Auto-polls payment status (every 3 seconds)
 * - Shows completion status with visual progress
 * - Copy-to-clipboard for payment reference
 * - Retry button on timeout
 */
export function SepayQRDisplay({
    orderId,
    payment,
    amountInt,
    onPaymentSuccess,
}: SepayQRDisplayProps) {
    const { isPaid, loading, error, startPolling, stopPolling } = usePaymentStatus({
        orderId,
        autoStart: true,
        pollInterval: 3000,
        maxAttempts: 300, // 300 × 3s = 900s = 15 minutes
    })

    const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes
    const [attempts, setAttempts] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)

    const amountVND = formatPrice(amountInt)
    const maxTimeout = 900 // 15 minutes in seconds
    const progressPercent = ((maxTimeout - timeRemaining) / maxTimeout) * 100

    // Update countdown timer
    useEffect(() => {
        if (isPaid || error) return

        const interval = setInterval(() => {
            setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
            setAttempts((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isPaid, error])

    const handleCopyReference = () => {
        const reference = `DH${orderId}`
        navigator.clipboard.writeText(reference)
        toast.success("Đã sao chép mã đơn hàng")
    }

    const handleRetry = () => {
        setIsRetrying(true)
        setTimeRemaining(900) // Reset to 15 minutes
        stopPolling()
        setTimeout(() => {
            startPolling()
            setIsRetrying(false)
        }, 500)
    }

    useEffect(() => {
        if (isPaid) {
            toast.success("Thanh toán thành công!")
            onPaymentSuccess?.()
        }
    }, [isPaid, onPaymentSuccess])

    if (isPaid) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Thanh toán thành công
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-green-700">
                        Đơn hàng của bạn đã được xác nhận thanh toán. Cảm ơn bạn đã mua hàng!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* QR Code Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Quét mã QR để thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* QR Code Image */}
                    {payment.qrCode && (
                        <div className="flex justify-center">
                            <div className="rounded-lg border border-gray-200 p-4 bg-white">
                                <img
                                    src={payment.qrCode}
                                    alt="SePay QR Code"
                                    className="h-48 w-48"
                                    onError={(e) => {
                                        console.error("Failed to load QR code:", e)
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Số tiền</span>
                            <span className="font-semibold">{amountVND}₫</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Mã đơn hàng</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">DH{orderId}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyReference}
                                    className="h-6 w-6 p-0"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ngân hàng</span>
                            <span className="font-semibold">Vietcombank</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                        <p className="font-semibold mb-2">Hướng dẫn thanh toán:</p>
                        <ol className="list-inside list-decimal space-y-1">
                            <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                            <li>Chọn chức năng quét mã QR</li>
                            <li>Quét mã QR ở trên</li>
                            <li>Xác nhận và hoàn tất thanh toán</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            {/* Status Card */}
            <Card className={error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {loading && <Clock className="h-5 w-5 animate-pulse text-blue-500" />}
                        {error && <AlertCircle className="h-5 w-5 text-red-600" />}
                        {!loading && !error && (
                            <Clock className="h-5 w-5 text-blue-500" />
                        )}
                        <span className={error ? "text-red-700" : "text-blue-700"}>
                            {loading
                                ? "Chờ thanh toán..."
                                : error
                                    ? "Hết hạn thanh toán"
                                    : "Đang chờ thanh toán"}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error ? (
                        <>
                            <div className="flex gap-2 text-sm text-red-700 bg-red-100 p-3 rounded border border-red-300">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">⏰ Hết hạn thanh toán</p>
                                    <p className="text-xs mt-1">{error}</p>
                                </div>
                            </div>
                            <p className="text-sm text-red-700">
                                Bạn đã không hoàn thành thanh toán trong thời gian cho phép. Vui lòng thử lại hoặc kiểm tra trạng thái đơn hàng.
                            </p>
                            <Button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                variant="outline"
                                className="w-full"
                            >
                                <RotateCw className="h-4 w-4 mr-2" />
                                {isRetrying ? "Đang khôi phục..." : "Kiểm tra lại"}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Progress Indicator */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700 font-medium">⏱️ Thời gian còn lại</span>
                                    <span className="font-mono text-lg font-bold text-blue-600">
                                        {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-blue-600 text-right">
                                    Kiểm tra: {Math.ceil(attempts / 3)}/300 lần
                                </p>
                            </div>

                            {/* Info Messages */}
                            <div className="space-y-2 bg-blue-100 p-3 rounded-lg border border-blue-300">
                                <p className="text-sm font-semibold text-blue-800">📋 Vui lòng thanh toán trước khi hết hạn:</p>
                                <div className="space-y-1">
                                    <div className="flex gap-2 text-sm text-blue-700">
                                        <span className="text-lg leading-none">✓</span>
                                        <span>Mở app ngân hàng và quét mã QR ở trên</span>
                                    </div>
                                    <div className="flex gap-2 text-sm text-blue-700">
                                        <span className="text-lg leading-none">✓</span>
                                        <span>Hệ thống tự động cập nhật khi nhận thanh toán</span>
                                    </div>
                                    <div className="flex gap-2 text-sm text-blue-700">
                                        <span className="text-lg leading-none">✓</span>
                                        <span>Không đóng trang hoặc làm mới trong khi chờ</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
