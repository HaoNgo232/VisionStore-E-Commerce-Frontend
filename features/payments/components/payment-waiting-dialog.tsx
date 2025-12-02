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
import { AlertCircle, Clock, Copy, Loader2, ChevronDown } from "lucide-react";
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
    const [showManualInfo, setShowManualInfo] = useState(false);

    const { isPolling, error, stopPolling } = usePaymentPolling({
        orderId,
        onSuccess,
        onTimeout,
        onError,
        enabled: open,
    });

    const amountVND = formatPrice(amountInt);

    // Reset manual info when dialog opens
    useEffect(() => {
        if (open) {
            setShowManualInfo(false);
        }
    }, [open]);

    const handleCopyReference = (): void => {
        const reference = `DH${orderId}`;
        void navigator.clipboard.writeText(reference);
        toast.success("Đã sao chép mã đơn hàng");
    };

    const handleCopyAccountInfo = (): void => {
        const accountInfo = `Ngân hàng: BIDV\nSố tài khoản: 96247HAOVAO\nTên tài khoản: NGO GIA HAO\nNội dung: DH${orderId}`;
        void navigator.clipboard.writeText(accountInfo);
        toast.success("Đã sao chép thông tin tài khoản");
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
                    {!isPolling && error && (
                        <p
                            className="mt-1 text-sm text-red-600"
                            data-testid="payment-error-message"
                        >
                            {error}
                        </p>
                    )}
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
                                    <span className="font-semibold">BIDV</span>
                                </div>
                            </div>

                            {/* Manual Transfer Info - Collapsible */}
                            <div className="border rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowManualInfo(!showManualInfo)}
                                    className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <span>Thông tin chuyển khoản thủ công</span>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${showManualInfo ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {showManualInfo && (
                                    <div className="px-3 pb-3 space-y-2 border-t pt-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Số tài khoản:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold">
                                                    96247HAOVAO
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopyAccountInfo}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tên tài khoản:</span>
                                            <span className="font-semibold">
                                                NGO GIA HAO
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Nội dung:</span>
                                            <span className="font-mono font-semibold">
                                                DH{orderId}
                                            </span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t text-xs text-gray-500">
                                            💡 Mở app ngân hàng → Chọn chuyển khoản → Nhập thông
                                            tin trên → Xác nhận
                                        </div>
                                    </div>
                                )}
                            </div>
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