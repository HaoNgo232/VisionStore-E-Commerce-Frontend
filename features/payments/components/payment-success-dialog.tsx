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

            // Play success sound (optional - browser support)
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTUIHm7A7+OZTA==');
                audio.volume = 0.3;
                audio.play().catch(() => { }); // Ignore if blocked by browser
            } catch (e) {
                // Ignore audio errors
            }
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

    // Prevent closing dialog during countdown
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && countdown > 0 && autoRedirect) {
            // Prevent closing during auto-redirect countdown
            return;
        }
        handleClose();
    };

    const amountVND = formatPrice(order.totalInt);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-10 h-10 text-green-600" data-testid="check-circle-icon" />
                            </div>
                            {/* Success ripple effect - multiple layers for better visibility */}
                            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-30"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-pulse opacity-40" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
                        Thanh toán thành công! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
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
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-sm">
                            <p className="text-sm font-medium text-blue-800 mb-1">
                                ⏱️ Tự động chuyển trang sau
                            </p>
                            <p className="text-3xl font-bold text-blue-900 tabular-nums">
                                {countdown}s
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Bạn có thể đóng hoặc xem chi tiết ngay
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