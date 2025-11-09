/**
 * Orders Table Columns Definition
 * Column definitions for admin orders data table using @tanstack/react-table
 */

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import { PaymentStatus } from "@/types/order.types";
import { OrderStatusBadge } from "./order-status-badge";
import { formatPrice } from "@/features/products/utils";

interface OrdersTableColumnsProps {
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format order ID for display (truncate if too long)
 */
function formatOrderId(orderId: string): string {
  if (orderId.length > 12) {
    return `${orderId.slice(0, 8)}...`;
  }
  return orderId;
}

export function createOrdersTableColumns({
  onView,
  onUpdateStatus,
}: OrdersTableColumnsProps): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order ID
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <button
            onClick={() => onView(row.original)}
            className="font-mono text-sm text-primary hover:underline"
          >
            {formatOrderId(row.original.id)}
          </button>
        );
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User ID
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-mono text-sm text-muted-foreground">
            {formatOrderId(row.original.userId)}
          </div>
        );
      },
    },
    {
      accessorKey: "totalInt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Amount
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-semibold">{formatPrice(row.original.totalInt, "VND")}</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <OrderStatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const paymentStatus = row.original.paymentStatus;
        return (
          <Badge
            variant={paymentStatus === PaymentStatus.PAID ? "default" : "destructive"}
          >
            {paymentStatus === PaymentStatus.PAID ? "Paid" : "Unpaid"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created Date
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-sm">{formatDate(row.original.createdAt)}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                Update status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

