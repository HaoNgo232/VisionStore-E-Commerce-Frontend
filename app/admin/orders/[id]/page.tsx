/**
 * Admin Order Detail Page
 * Page for viewing individual order details
 */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { OrderStatusUpdateDialog } from "@/features/orders/components/order-status-update-dialog";
import { useUpdateOrderStatus } from "@/features/orders/hooks/use-orders-admin";
import { ordersApi } from "@/features/orders/services/orders.service";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateOrderStatusRequest } from "@/types";
import { OrderStatus } from "@/types/order.types";

interface OrderDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default function OrderDetailPage({
  params,
}: OrderDetailPageProps): React.ReactElement {
  const { id } = use(params);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id),
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (): void => {
    setStatusDialogOpen(true);
  };

  const handleCancel = (): void => {
    // Open status dialog with cancel option
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async (
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<void> => {
    await updateStatusMutation.mutateAsync({ orderId, data });
    setStatusDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Order not found"}
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order {order.id.slice(0, 8)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to orders</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        </div>
      </div>

      <OrderDetailView
        order={order}
        onUpdateStatus={handleUpdateStatus}
        onCancel={order.status !== OrderStatus.CANCELLED ? handleCancel : undefined}
      />

      <OrderStatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        order={order}
        onSave={handleSaveStatus}
      />
    </div>
  );
}

