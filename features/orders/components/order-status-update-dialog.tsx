/**
 * Order Status Update Dialog
 * Dialog form for updating order status and payment status (Admin)
 */

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Order, UpdateOrderStatusRequest } from "@/types";
import { OrderStatus, PaymentStatus } from "@/types/order.types";
import { OrderStatusBadge } from "./order-status-badge";

const orderStatusUpdateFormSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

type OrderStatusUpdateFormValues = z.infer<typeof orderStatusUpdateFormSchema>;

/**
 * Get valid next statuses based on current status
 * Matches backend validation logic in orders.service.ts
 */
function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [], // Cannot change once delivered
    [OrderStatus.CANCELLED]: [], // Cannot change once cancelled
  };

  const allowedStatuses = validTransitions[currentStatus] || [];
  // Include current status (no change) + allowed transitions
  return [currentStatus, ...allowedStatuses];
}

interface OrderStatusUpdateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly order: Order | null;
  readonly onSave: (orderId: string, data: UpdateOrderStatusRequest) => Promise<void>;
}

export function OrderStatusUpdateDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderStatusUpdateDialogProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderStatusUpdateFormValues>({
    resolver: zodResolver(orderStatusUpdateFormSchema),
    defaultValues: {
      status: OrderStatus.PENDING,
      paymentStatus: undefined,
    },
  });

  // Reset form khi order thay đổi hoặc dialog mở
  useEffect(() => {
    if (order && open) {
      form.reset({
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }
  }, [order, open, form]);

  const onSubmit = async (values: OrderStatusUpdateFormValues): Promise<void> => {
    if (!order) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateOrderStatusRequest = {
        status: values.status,
        ...(values.paymentStatus !== undefined && { paymentStatus: values.paymentStatus }),
      };
      await onSave(order.id, updateData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update order status and payment status. Order ID: {order.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Status</p>
            <div className="flex items-center gap-2">
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
        </div>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const validStatuses = getValidNextStatuses(order.status);
                const statusLabels: Record<OrderStatus, string> = {
                  [OrderStatus.PENDING]: "Pending",
                  [OrderStatus.PROCESSING]: "Processing",
                  [OrderStatus.SHIPPED]: "Shipped",
                  [OrderStatus.DELIVERED]: "Delivered",
                  [OrderStatus.CANCELLED]: "Cancelled",
                };

                return (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value as OrderStatus)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {validStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                            {status === order.status && " (Current)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {validStatuses.length === 1
                        ? "This order cannot be transitioned to another status. You can still update payment status."
                        : `Valid transitions: ${validStatuses.map((s) => statusLabels[s]).join(", ")}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none" ? undefined : (value as PaymentStatus),
                      )
                    }
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Keep current</SelectItem>
                      <SelectItem value={PaymentStatus.UNPAID}>Unpaid</SelectItem>
                      <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Leave as "Keep current" to only update order status
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

