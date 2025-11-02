"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, Copy } from "lucide-react"
import { toast } from "sonner"
import { usePaymentStatus } from "@/features/payments/hooks/use-payment-status"
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
 * - Shows QR code image
 * - Displays payment details (amount, order ID)
 * - Auto-polls payment status (every 3 seconds)
 * - Shows completion status
 * - Copy-to-clipboard for payment reference
 */
export function SepayQRDisplay({
    orderId,
    payment,
    amountInt,
    onPaymentSuccess,
}: SepayQRDisplayProps) {
    const { isPaid, loading, error, startPolling } = usePaymentStatus({
        orderId,
        autoStart: true,
        pollInterval: 3000,
        maxAttempts: 40,
    })

    const amountVND = (amountInt / 100).toLocaleString("vi-VN")

    const handleCopyReference = () => {
        const reference = `DH${orderId}`
        navigator.clipboard.writeText(reference)
        toast.success("Đã sao chép mã đơn hàng")
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {loading && <Clock className="h-5 w-5 animate-spin text-blue-500" />}
                        {error && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {!loading && !error && (
                            <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <span>
                            {loading
                                ? "Đang kiểm tra thanh toán..."
                                : error
                                    ? "Lỗi kiểm tra thanh toán"
                                    : "Chờ xác nhận thanh toán"}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}
                    {!error && !isPaid && (
                        <p className="text-sm text-gray-600">
                            Hệ thống sẽ tự động cập nhật trạng thái khi nhận được thanh toán.
                            Vui lòng không đóng trang này.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
