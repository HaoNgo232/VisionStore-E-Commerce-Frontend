"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Copy, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePaymentPolling } from "../hooks/use-payment-polling";
import { formatPrice } from "@/features/products/utils";
import type { PaymentProcessResponse } from "@/types";

interface PaymentWaitingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    payment: PaymentProcessResponse;
    amountInt: number;
    onSuccess?: (payment: any) => void;
    onTimeout?: () => void;
    onError?: (error: string) => void;
}

export function PaymentWaitingDialog({
    open,
    onOpenChange,
    orderId,
    payment,
    amountInt,
    onSuccess,
    onTimeout,
    onError,
}: PaymentWaitingDialogProps) {
    const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
    const [isRetrying, setIsRetrying] = useState(false);

    const { isPolling, attempts, error, stopPolling } = usePaymentPolling({
        orderId,
        onSuccess,
        onTimeout,
        onError,
        enabled: open,
    });

    const amountVND = formatPrice(amountInt);
    const maxTimeout = 900; // 15 minutes in seconds
    const progressPercent = ((maxTimeout - timeRemaining) / maxTimeout) * 100;

    // Update countdown timer
    useEffect(() => {
        if (!isPolling || !open) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPolling, open]);

    // Reset timer when dialog opens
    useEffect(() => {
        if (open) {
            setTimeRemaining(900);
            setIsRetrying(false);
        }
    }, [open]);

    const handleCopyReference = () => {
        const reference = `DH${orderId}`;
        navigator.clipboard.writeText(reference);
        toast.success("Đã sao chép mã đơn hàng");
    };

    const handleCopyAccountInfo = () => {
        const accountInfo = `Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nTên tài khoản: CONG TY TNHH E-COMMERCE\nNội dung: DH${orderId}`;
        navigator.clipboard.writeText(accountInfo);
        toast.success("Đã sao chép thông tin tài khoản");
    };

    const handleRetry = () => {
        setIsRetrying(true);
        setTimeRemaining(900); // Reset to 15 minutes
        stopPolling();
        setTimeout(() => {
            // The polling will restart automatically when enabled
            setIsRetrying(false);
        }, 1000);
    };

    const handleClose = () => {
        if (isPolling) {
            // Prevent closing during polling
            return;
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                showCloseButton={!isPolling} // Hide close button during polling
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPolling && <Loader2 className="h-5 w-5 animate-spin" />}
                        {!isPolling && error && <AlertCircle className="h-5 w-5 text-red-600" />}
                        {!isPolling && !error && <Clock className="h-5 w-5 text-blue-600" />}
                        Thanh toán đơn hàng
                    </DialogTitle>
                    <DialogDescription>
                        Vui lòng hoàn tất thanh toán trong thời gian quy định
                    </DialogDescription>
                </DialogHeader>

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
                                                console.error("Failed to load QR code:", e);
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

                            {/* Manual Account Info */}
                            <div className="rounded-lg bg-blue-50 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-blue-800">
                                        Thông tin chuyển khoản thủ công
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyAccountInfo}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-1 text-sm text-blue-700">
                                    <div>🏦 Ngân hàng: Vietcombank</div>
                                    <div>💳 Số tài khoản: 1234567890</div>
                                    <div>👤 Tên tài khoản: CONG TY TNHH E-COMMERCE</div>
                                    <div>📝 Nội dung: DH{orderId}</div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                                <p className="font-semibold mb-2">Hướng dẫn thanh toán:</p>
                                <ol className="list-inside list-decimal space-y-1">
                                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li>Chọn chức năng quét mã QR hoặc chuyển khoản</li>
                                    <li>Quét mã QR ở trên hoặc nhập thông tin thủ công</li>
                                    <li>Xác nhận và hoàn tất thanh toán</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Card */}
                    <Card className={error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {isPolling && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                                {error && <AlertCircle className="h-5 w-5 text-red-600" />}
                                {!isPolling && !error && <Clock className="h-5 w-5 text-blue-500" />}
                                <span className={error ? "text-red-700" : "text-blue-700"}>
                                    {isPolling
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
                                            Kiểm tra: {attempts}/180 lần
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
                                                <span>Không đóng dialog trong khi chờ thanh toán</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}