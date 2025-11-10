/**
 * Admin Products List Page
 * Product management page for admins
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductsListCard } from "@/features/products/components/admin/products-list-card";
import { AdminProductFilters } from "@/features/products/components/admin/product-filters";
import { DeleteProductDialog } from "@/features/products/components/admin/delete-product-dialog";
import {
    useAdminProducts,
    useDeleteProduct,
} from "@/features/products/hooks/use-admin-products";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { AdminProductQueryParams } from "@/types/product.types";
import type { Product } from "@/types";

export default function AdminProductsPage(): React.ReactElement {
    const [filters, setFilters] = useState<AdminProductQueryParams>({
        page: 1,
        pageSize: 10,
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, isLoading, error } = useAdminProducts(filters);
    const deleteProduct = useDeleteProduct();
    const { categories: categoriesData, loading: categoriesLoading } = useCategories();

    const handleFiltersChange = useCallback((
        newFiltersOrUpdater: AdminProductQueryParams | ((prev: AdminProductQueryParams) => AdminProductQueryParams)
    ): void => {
        setFilters(newFiltersOrUpdater);
    }, []);

    const handlePageChange = useCallback((page: number): void => {
        setFilters((prev) => ({ ...prev, page }));
    }, []);

    const handleDeleteClick = useCallback((product: Product): void => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = async (): Promise<void> => {
        if (selectedProduct) {
            await deleteProduct.mutateAsync(selectedProduct.id);
            setDeleteDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground">
                        Quản lý danh sách sản phẩm trong cửa hàng
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="size-4 mr-2" />
                        Tạo sản phẩm mới
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminProductFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        categories={categoriesData}
                        isLoading={categoriesLoading}
                    />
                </CardContent>
            </Card>

            {/* Products List */}
            <ProductsListCard
                data={data}
                            isLoading={isLoading}
                error={error}
                            onPageChange={handlePageChange}
                            onDelete={handleDeleteClick}
                        />

            {/* Delete Confirmation Dialog */}
            <DeleteProductDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                product={selectedProduct}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteProduct.isPending}
            />
        </div>
    );
}

