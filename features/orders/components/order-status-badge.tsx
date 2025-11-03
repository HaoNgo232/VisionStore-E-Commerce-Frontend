import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

/**
 * OrderStatusBadge Component
 * Displays order status with color-coded badge
 *
 * Status mapping:
 * - PENDING: "Chờ xử lý" (yellow)
 * - PROCESSING: "Đang xử lý" (yellow)
 * - SHIPPED: "Đang giao hàng" (purple)
 * - DELIVERED: "Đã giao hàng" (green)
 * - CANCELLED: "Đã hủy" (red)
 */

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const statusConfig: Record<
    OrderStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    [OrderStatus.PENDING]: {
        label: "Chờ xử lý",
        variant: "outline", // yellow alternative
    },
    [OrderStatus.PROCESSING]: {
        label: "Đang xử lý",
        variant: "outline", // yellow alternative
    },
    [OrderStatus.SHIPPED]: {
        label: "Đang giao hàng",
        variant: "secondary", // purple
    },
    [OrderStatus.DELIVERED]: {
        label: "Đã giao hàng",
        variant: "default", // green
    },
    [OrderStatus.CANCELLED]: {
        label: "Đã hủy",
        variant: "destructive", // red
    },
};

export function OrderStatusBadge({
    status,
    className,
}: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}
