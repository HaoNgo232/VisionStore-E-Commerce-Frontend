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
    readonly onFiltersChange: (
        filters: AdminProductQueryParams | ((prev: AdminProductQueryParams) => AdminProductQueryParams)
    ) => void;
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
        // Trim và normalize search term
        const trimmedSearch = searchValue.trim();

        onFiltersChange((prevFilters) => {
            const newFilters: AdminProductQueryParams = {
                ...prevFilters,
                page: 1, // Reset to first page
            };
            if (trimmedSearch) {
                // Backend đã xử lý case-insensitive, chỉ cần trim
                newFilters.search = trimmedSearch;
            } else {
                delete newFilters.search;
            }
            return newFilters;
        });
    }, [onFiltersChange]);

    const handleCategoryChange = useCallback((categorySlug: string): void => {
        onFiltersChange((prevFilters) => {
            const newFilters: AdminProductQueryParams = {
                ...prevFilters,
                page: 1, // Reset to first page when filter changes
            };
            // Map "all" value to undefined (no filter)
            if (categorySlug && categorySlug !== "all") {
                newFilters.categorySlug = categorySlug;
            } else {
                delete newFilters.categorySlug;
            }
            return newFilters;
        });
    }, [onFiltersChange]);

    const handleClearFilters = useCallback((): void => {
        onFiltersChange((prevFilters) => {
            const newFilters: AdminProductQueryParams = {
                page: 1,
            };
            // Backend uses 'pageSize', not 'limit'
            if (prevFilters.pageSize) {
                newFilters.pageSize = prevFilters.pageSize;
            }
            return newFilters;
        });
    }, [onFiltersChange]);

    const hasActiveFilters = Boolean(
        filters.search ??
        (filters.categorySlug && filters.categorySlug !== "all")
    );

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
                value={(filters.categorySlug ?? "all") as string}
                onValueChange={handleCategoryChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
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

