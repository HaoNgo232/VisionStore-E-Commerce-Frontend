"use client";

import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

const statusConfig = {
    [PaymentStatus.UNPAID]: {
        label: "Chưa thanh toán",
        variant: "outline" as const,
    },
    [PaymentStatus.PAID]: {
        label: "Đã thanh toán",
        variant: "default" as const,
    },
} as const;

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={className} data-testid="payment-status-badge">
            {config.label}
        </Badge>
    );
}