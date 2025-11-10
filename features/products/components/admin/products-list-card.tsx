/**
 * Products List Card Component
 * Memoized component để chỉ re-render khi data thay đổi
 */

"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductList } from "./product-list";
import type { Product } from "@/types";
import type { PaginatedResponse } from "@/types";

interface ProductsListCardProps {
    readonly data: PaginatedResponse<Product> | undefined;
    readonly isLoading: boolean;
    readonly error: Error | null;
    readonly onPageChange: (page: number) => void;
    readonly onDelete: (product: Product) => void;
}

export const ProductsListCard = memo(function ProductsListCard({
    data,
    isLoading,
    error,
    onPageChange,
    onDelete,
}: ProductsListCardProps): React.ReactElement {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Danh sách sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-destructive mb-4">
                            Lỗi khi tải danh sách sản phẩm: {error.message}
                        </p>
                        <Button onClick={() => globalThis.location.reload()}>
                            Thử lại
                        </Button>
                    </div>
                ) : (
                    <ProductList
                        products={data?.products ?? []}
                        isLoading={isLoading}
                        {...(data && {
                            pagination: {
                                page: data.page,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages,
                            },
                        })}
                        onPageChange={onPageChange}
                        onDelete={onDelete}
                    />
                )}
            </CardContent>
        </Card>
    );
});

