import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/types"
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"

interface OrderCardProps {
  order: Order
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, variant: "secondary" as const },
  processing: { label: "Processing", icon: Package, variant: "default" as const },
  shipped: { label: "Shipped", icon: Truck, variant: "default" as const },
  delivered: { label: "Delivered", icon: CheckCircle, variant: "default" as const },
  cancelled: { label: "Cancelled", icon: XCircle, variant: "destructive" as const },
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
            <div key={item.productId} className="flex gap-3">
              <img
                src={item.product.images[0] || "/placeholder.svg"}
                alt={item.product.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {order.status === "shipped" && order.trackingNumber && (
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium mb-1">Shipping Address</p>
          <p className="text-muted-foreground">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && (
              <>
                <br />
                {order.shippingAddress.addressLine2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
