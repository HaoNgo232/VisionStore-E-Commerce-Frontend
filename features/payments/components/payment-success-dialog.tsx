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
import { CheckCircle, X } from "lucide-react";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { formatPrice } from "@/features/products/utils";
import type { Order } from "@/types";

interface PaymentSuccessDialogProps {
    open: boolean;
    order: Order;
    onViewOrder: (orderId: string) => void;
    onClose?: () => void;
    autoRedirect?: boolean; // default: true
    redirectDelay?: number; // default: 3000ms
}

export function PaymentSuccessDialog({
    open,
    order,
    onViewOrder,
    onClose,
    autoRedirect = true,
    redirectDelay = 3000,
}: PaymentSuccessDialogProps) {
    const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));
    const [isAnimating, setIsAnimating] = useState(false);

    // Start animation when dialog opens
    useEffect(() => {
        if (open) {
            setIsAnimating(true);
            setCountdown(Math.ceil(redirectDelay / 1000));
        } else {
            setIsAnimating(false);
        }
    }, [open, redirectDelay]);

    // Countdown timer for auto-redirect
    useEffect(() => {
        if (!open || !autoRedirect || countdown <= 0) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Auto redirect when countdown reaches 0
                    handleViewOrder();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open, autoRedirect, countdown]);

    const handleViewOrder = () => {
        onViewOrder(order.id);
        if (onClose) onClose();
    };

    const handleClose = () => {
        if (onClose) onClose();
    };

    const amountVND = formatPrice(order.totalInt);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" data-testid="check-circle-icon" />
                            </div>
                            {/* Success ripple effect */}
                            <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-20"></div>
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-green-700">
                        Thanh toán thành công! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Đơn hàng của bạn đã được xử lý thành công
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary Card */}
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-green-800">
                                Thông tin đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-green-700">Mã đơn hàng</span>
                                <span className="font-mono font-semibold text-green-800">
                                    {order.id}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-green-700">Tổng tiền</span>
                                <span className="font-semibold text-green-800">{amountVND}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-green-700">Phương thức</span>
                                <span className="font-semibold text-green-800">SePay QR</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-green-700">Trạng thái đơn hàng</span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-green-700">Trạng thái thanh toán</span>
                                <PaymentStatusBadge status={order.paymentStatus} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Auto-redirect notice */}
                    {autoRedirect && countdown > 0 && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">
                                Chuyển đến trang chi tiết đơn hàng sau{" "}
                                <span className="font-mono font-bold text-blue-800">
                                    {countdown}s
                                </span>
                                ...
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleViewOrder}
                            className="flex-1"
                            size="lg"
                        >
                            Xem chi tiết đơn hàng
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            size="lg"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}