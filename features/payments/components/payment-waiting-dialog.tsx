"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePaymentPolling } from "../hooks/use-payment-polling";
import { formatPrice } from "@/features/products/utils";
import type { PaymentProcessResponse, Payment } from "@/types";

interface PaymentWaitingDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly orderId: string;
    readonly payment: PaymentProcessResponse;
    readonly amountInt: number;
    readonly onSuccess?: (payment: Payment) => void;
    readonly onTimeout?: () => void;
    readonly onError?: (error: string) => void;
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
}: PaymentWaitingDialogProps): JSX.Element {
    const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
    const [_isRetrying, setIsRetrying] = useState(false);

    const { isPolling, attempts: _attempts, error, stopPolling } = usePaymentPolling({
        orderId,
        onSuccess,
        onTimeout,
        onError,
        enabled: open,
    });

    const amountVND = formatPrice(amountInt);
    const maxTimeout = 900; // 15 minutes in seconds
    const _progressPercent = ((maxTimeout - timeRemaining) / maxTimeout) * 100;

    // Update countdown timer - only when dialog is open AND polling
    useEffect(() => {
        if (!isPolling || !open) {
            // Reset timer when dialog closes
            if (!open) {
                setTimeRemaining(900);
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [isPolling, open]);

    // Reset timer when dialog opens
    useEffect(() => {
        if (open) {
            setTimeRemaining(900);
            setIsRetrying(false);
        }
    }, [open]);

    const handleCopyReference = (): void => {
        const reference = `DH${orderId}`;
        void navigator.clipboard.writeText(reference);
        toast.success("Đã sao chép mã đơn hàng");
    };

    const _handleCopyAccountInfo = (): void => {
        const accountInfo = `Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nTên tài khoản: CONG TY TNHH E-COMMERCE\nNội dung: DH${orderId}`;
        void navigator.clipboard.writeText(accountInfo);
        toast.success("Đã sao chép thông tin tài khoản");
    };

    const _handleRetry = (): void => {
        setIsRetrying(true);
        setTimeRemaining(900); // Reset to 15 minutes
        stopPolling();
        setTimeout(() => {
            // The polling will restart automatically when enabled
            setIsRetrying(false);
        }, 1000);
    };

    // Prevent backdrop click from closing dialog when polling
    const handleOpenChange = (newOpen: boolean): void => {
        if (!newOpen && isPolling) {
            // Block backdrop click during polling
            return;
        }
        onOpenChange(newOpen);
    };

    const handleForceClose = (): void => {
        // User can force close even during polling
        stopPolling();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                showCloseButton={!isPolling}
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
                                        <Image
                                            src={payment.qrCode}
                                            alt="SePay QR Code"
                                            width={192}
                                            height={192}
                                            className="h-48 w-48"
                                            data-testid="qr-code"
                                            onError={() => {
                                                // Handle error silently or show toast
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Số tiền</span>
                                    <span className="font-semibold">{amountVND}</span>
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
                            {/* <div className="rounded-lg bg-blue-50 p-4">
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
                            </div> */}

                            {/* Instructions */}
                            {/* <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                                <p className="font-semibold mb-2">Hướng dẫn thanh toán:</p>
                                <ol className="list-inside list-decimal space-y-1">
                                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li>Chọn chức năng quét mã QR hoặc chuyển khoản</li>
                                    <li>Quét mã QR ở trên hoặc nhập thông tin thủ công</li>
                                    <li>Xác nhận và hoàn tất thanh toán</li>
                                </ol>
                            </div> */}
                        </CardContent>
                    </Card>


                    {/* Force Close Button */}
                    <Button
                        onClick={handleForceClose}
                        variant="destructive"
                        className="w-full"
                    >
                        Hủy bỏ thanh toán
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}