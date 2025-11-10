/**
 * Admin Product Filters Component
 * Search and category filter for admin product list
 */

"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";
import type { AdminProductQueryParams } from "@/types/product.types";
import type { Category } from "@/types";

interface AdminProductFiltersProps {
    readonly filters: AdminProductQueryParams;
    readonly onFiltersChange: (filters: AdminProductQueryParams) => void;
    readonly categories?: Category[];
    readonly isLoading?: boolean;
}

export function AdminProductFilters({
    filters,
    onFiltersChange,
    categories = [],
    isLoading = false,
}: AdminProductFiltersProps): React.ReactElement {
    // Xử lý search từ SearchInput component
    const handleSearch = useCallback((searchValue: string): void => {
        const newFilters: AdminProductQueryParams = {
            ...filters,
            page: 1, // Reset to first page
        };
        if (searchValue) {
            newFilters.search = searchValue;
        } else {
            delete newFilters.search;
        }
        onFiltersChange(newFilters);
    }, [filters, onFiltersChange]);

    const handleCategoryChange = useCallback((categoryId: string): void => {
        const newFilters: AdminProductQueryParams = {
            ...filters,
            page: 1, // Reset to first page when filter changes
        };
        // Map "all" value to undefined (no filter)
        if (categoryId && categoryId !== "all") {
            newFilters.categoryId = categoryId;
        } else {
            delete newFilters.categoryId;
        }
        onFiltersChange(newFilters);
    }, [filters, onFiltersChange]);

    const handleClearFilters = useCallback((): void => {
        const newFilters: AdminProductQueryParams = {
            page: 1,
        };
        // Backend uses 'pageSize', not 'limit'
        if (filters.pageSize) {
            newFilters.pageSize = filters.pageSize;
        }
        onFiltersChange(newFilters);
    }, [filters, onFiltersChange]);

    const hasActiveFilters = Boolean(filters.search ?? (filters.categoryId ?? "all") !== "all");

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Input */}
            <SearchInput
                placeholder="Tìm kiếm sản phẩm..."
                onSearch={handleSearch}
                disabled={isLoading}
            />

            {/* Category Filter */}
            <Select
                value={filters.categoryId ?? "all"}
                onValueChange={handleCategoryChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <X className="size-4" />
                    Xóa bộ lọc
                </Button>
            )}
        </div>
    );
}

