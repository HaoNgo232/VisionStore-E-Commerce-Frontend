/**
 * Orders Filters Component
 * Search and filter controls for admin orders list
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { OrderAdminListQuery } from "@/types/order.types";
import { OrderStatus, PaymentStatus } from "@/types/order.types";

interface OrdersFiltersProps {
  readonly query: OrderAdminListQuery;
  readonly onQueryChange: (query: OrderAdminListQuery) => void;
}

export function OrdersFilters({
  query,
  onQueryChange,
}: OrdersFiltersProps): React.ReactElement {
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const queryRef = useRef(query);
  const isInternalSearchChangeRef = useRef(false);

  // Update ref khi query thay đổi từ bên ngoài
  useEffect(() => {
    queryRef.current = query;
    // Sync searchValue với query.search chỉ khi thay đổi từ bên ngoài (không phải từ internal search)
    if (!isInternalSearchChangeRef.current && query.search !== searchValue) {
      setSearchValue(query.search ?? "");
    }
    isInternalSearchChangeRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.pageSize, query.status, query.paymentStatus, query.startDate, query.endDate, query.search]);

  // Debounce search input - chỉ chạy khi searchValue thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      isInternalSearchChangeRef.current = true;
      const currentQuery = queryRef.current;
      const newQuery: OrderAdminListQuery = {
        ...(currentQuery.page !== undefined && { page: currentQuery.page }),
        ...(currentQuery.pageSize !== undefined && { pageSize: currentQuery.pageSize }),
        ...(currentQuery.status !== undefined && { status: currentQuery.status }),
        ...(currentQuery.paymentStatus !== undefined && { paymentStatus: currentQuery.paymentStatus }),
        ...(searchValue ? { search: searchValue } : {}),
        ...(currentQuery.startDate !== undefined && { startDate: currentQuery.startDate }),
        ...(currentQuery.endDate !== undefined && { endDate: currentQuery.endDate }),
      };
      onQueryChange(newQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onQueryChange]);

  const handleStatusChange = (status: string): void => {
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
      ...(status !== "all" && { status: status as OrderStatus }),
      ...(query.paymentStatus !== undefined && { paymentStatus: query.paymentStatus }),
      ...(query.search !== undefined && { search: query.search }),
      ...(query.startDate !== undefined && { startDate: query.startDate }),
      ...(query.endDate !== undefined && { endDate: query.endDate }),
    };
    onQueryChange(newQuery);
  };

  const handlePaymentStatusChange = (paymentStatus: string): void => {
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
      ...(query.status !== undefined && { status: query.status }),
      ...(paymentStatus !== "all" && { paymentStatus: paymentStatus as PaymentStatus }),
      ...(query.search !== undefined && { search: query.search }),
      ...(query.startDate !== undefined && { startDate: query.startDate }),
      ...(query.endDate !== undefined && { endDate: query.endDate }),
    };
    onQueryChange(newQuery);
  };

  const handleStartDateChange = (date: string): void => {
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
      ...(query.status !== undefined && { status: query.status }),
      ...(query.paymentStatus !== undefined && { paymentStatus: query.paymentStatus }),
      ...(query.search !== undefined && { search: query.search }),
      ...(date ? { startDate: new Date(date).toISOString() } : {}),
      ...(query.endDate !== undefined && { endDate: query.endDate }),
    };
    onQueryChange(newQuery);
  };

  const handleEndDateChange = (date: string): void => {
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
      ...(query.status !== undefined && { status: query.status }),
      ...(query.paymentStatus !== undefined && { paymentStatus: query.paymentStatus }),
      ...(query.search !== undefined && { search: query.search }),
      ...(query.startDate !== undefined && { startDate: query.startDate }),
      ...(date
        ? {
          endDate: (() => {
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return endOfDay.toISOString();
          })(),
        }
        : {}),
    };
    onQueryChange(newQuery);
  };

  const handleClearSearch = (): void => {
    setSearchValue("");
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
      ...(query.status !== undefined && { status: query.status }),
      ...(query.paymentStatus !== undefined && { paymentStatus: query.paymentStatus }),
      ...(query.startDate !== undefined && { startDate: query.startDate }),
      ...(query.endDate !== undefined && { endDate: query.endDate }),
    };
    onQueryChange(newQuery);
  };

  const handleClearAll = (): void => {
    setSearchValue("");
    const newQuery: OrderAdminListQuery = {
      ...(query.page !== undefined && { page: query.page }),
      ...(query.pageSize !== undefined && { pageSize: query.pageSize }),
    };
    onQueryChange(newQuery);
  };

  // Convert ISO date strings to local date format for input
  const startDateValue = query.startDate
    ? new Date(query.startDate).toISOString().split("T")[0]
    : "";
  const endDateValue = query.endDate
    ? new Date(query.endDate).toISOString().split("T")[0]
    : "";

  const hasActiveFilters =
    Boolean(query.status) ||
    Boolean(query.paymentStatus) ||
    Boolean(query.search) ||
    Boolean(query.startDate) ||
    Boolean(query.endDate);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-sm">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or user ID..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 size-8 -translate-y-1/2"
              onClick={handleClearSearch}
            >
              <X className="size-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <Select
          value={query.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
            <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={query.paymentStatus ?? "all"}
          onValueChange={handlePaymentStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Statuses</SelectItem>
            <SelectItem value={PaymentStatus.UNPAID}>Unpaid</SelectItem>
            <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            placeholder="Start date"
            value={startDateValue}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full sm:w-[160px]"
          />
          <span className="text-muted-foreground hidden sm:inline">to</span>
          <Input
            type="date"
            placeholder="End date"
            value={endDateValue}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full sm:w-[160px]"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearAll}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

