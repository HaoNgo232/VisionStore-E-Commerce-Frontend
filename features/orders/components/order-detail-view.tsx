/**
 * Order Detail View Component
 * Detailed view of order information for admin
 */

"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types";
import { OrderStatus, PaymentStatus } from "@/types/order.types";
import { OrderStatusBadge } from "./order-status-badge";
import { formatPrice } from "@/features/products/utils";

interface OrderDetailViewProps {
  readonly order: Order;
  readonly onUpdateStatus?: () => void;
  readonly onCancel?: () => void;
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format order ID for display
 */
function formatOrderId(orderId: string): string {
  return orderId;
}

export function OrderDetailView({
  order,
  onUpdateStatus,
  onCancel,
}: OrderDetailViewProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Order Information */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle>Order Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Order ID: <span className="font-mono">{formatOrderId(order.id)}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <Badge
                variant={
                  order.paymentStatus === PaymentStatus.PAID
                    ? "default"
                    : "destructive"
                }
              >
                {order.paymentStatus === PaymentStatus.PAID ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{formatOrderId(order.userId)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Address ID
              </p>
              <p className="font-mono text-sm">
                {order.addressId ?? "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created Date
              </p>
              <p className="text-sm">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Updated Date
              </p>
              <p className="text-sm">{formatDate(order.updatedAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Amount
              </p>
              <p className="text-2xl font-bold">{formatPrice(order.totalInt, "VND")}</p>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            {onUpdateStatus && (
              <Button onClick={onUpdateStatus}>Update Status</Button>
            )}
            {onCancel && order.status !== OrderStatus.CANCELLED && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.imageUrls?.[0] ?? "/placeholder.svg"}
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        Product ID: {item.productId.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.priceInt, "VND")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(item.priceInt * item.quantity, "VND")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {formatPrice(order.totalInt, "VND")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

