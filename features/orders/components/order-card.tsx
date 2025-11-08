import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/types"
import { OrderStatus } from "@/types"
import { Package, Truck, CheckCircle, XCircle, Clock, type LucideIcon } from "lucide-react"
import { formatPrice } from "@/features/products/utils"
import type { VariantProps } from "class-variance-authority"

interface OrderCardProps {
  order: Order
}

type BadgeVariant = VariantProps<typeof Badge>["variant"]

const statusConfig: Record<OrderStatus, { label: string; icon: LucideIcon; variant: BadgeVariant }> = {
  [OrderStatus.PENDING]: { label: "Pending", icon: Clock, variant: "secondary" as const },
  [OrderStatus.PROCESSING]: { label: "Processing", icon: Package, variant: "default" as const },
  [OrderStatus.SHIPPED]: { label: "Shipped", icon: Truck, variant: "default" as const },
  [OrderStatus.DELIVERED]: { label: "Delivered", icon: CheckCircle, variant: "default" as const },
  [OrderStatus.CANCELLED]: { label: "Cancelled", icon: XCircle, variant: "destructive" as const },
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">Order {order.id}</p>
            <p className="text-sm text-muted-foreground">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge variant={status.variant}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />

        {/* Order Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.imageUrls?.[0] ?? "/placeholder.svg"}
                alt={item.productName}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">{formatPrice(item.priceInt * item.quantity)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold">{formatPrice(order.totalInt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {order.status === OrderStatus.SHIPPED && (
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium mb-1">Order Information</p>
          <p className="text-muted-foreground">
            Order Status: {statusConfig[order.status].label}
            <br />
            Payment Status: {order.paymentStatus}
            <br />
            Address ID: {order.addressId}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
