/**
 * Admin Orders List Page
 * Page for listing and managing orders
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { OrdersListTable } from "@/features/orders/components/orders-list-table";
import { OrdersFilters } from "@/features/orders/components/orders-filters";
import { OrderStatusUpdateDialog } from "@/features/orders/components/order-status-update-dialog";
import { useOrdersAdminList, useUpdateOrderStatus } from "@/features/orders/hooks/use-orders-admin";
import type {
  Order,
  UpdateOrderStatusRequest,
} from "@/types";
import type { OrderAdminListQuery } from "@/types/order.types";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage(): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState<OrderAdminListQuery>({
    page: 1,
    pageSize: 10,
  });
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const { data, isLoading, error } = useOrdersAdminList(query);
  const updateStatusMutation = useUpdateOrderStatus();

  // Memoize callbacks để tránh columns recreate
  const handleView = useCallback(
    (order: Order): void => {
      router.push(`/admin/orders/${order.id}`);
    },
    [router],
  );

  const handleUpdateStatus = useCallback(
    (order: Order): void => {
      setUpdatingOrder(order);
      setStatusDialogOpen(true);
    },
    [],
  );

  const handleSaveStatus = async (
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<void> => {
    await updateStatusMutation.mutateAsync({ orderId, data });
    setStatusDialogOpen(false);
    setUpdatingOrder(null);
  };

  const handlePageChange = useCallback(
    (page: number): void => {
      setQuery((prev: OrderAdminListQuery) => ({ ...prev, page }));
    },
    [],
  );

  // Memoize setQuery callback để tránh filters component re-render
  const handleQueryChange = useCallback(
    (newQuery: OrderAdminListQuery): void => {
      setQuery(newQuery);
    },
    [],
  );

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
              <BreadcrumbPage>Đơn hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý đơn hàng, theo dõi trạng thái và cập nhật thông tin thanh toán
          </p>
        </div>
      </div>

      <OrdersFilters query={query} onQueryChange={handleQueryChange} />

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Lỗi khi tải danh sách đơn hàng: {error.message}
          </p>
        </div>
      ) : (
        <>
          <OrdersListTable
            orders={data?.orders ?? []}
            loading={isLoading}
            onView={handleView}
            onUpdateStatus={handleUpdateStatus}
          />
          {data?.totalPages && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.max(1, data.page - 1))}
                disabled={data.page <= 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {data.page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  handlePageChange(Math.min(data.totalPages ?? 1, data.page + 1))
                }
                disabled={data.page >= (data.totalPages ?? 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      <OrderStatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        order={updatingOrder}
        onSave={handleSaveStatus}
      />
    </div>
  );
}

