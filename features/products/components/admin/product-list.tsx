/**
 * Admin Product List Component
 * DataTable with pagination for admin product management
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "../../utils";
import type { Product } from "@/types";

interface ProductListProps {
  readonly products: Product[];
  readonly isLoading?: boolean;
  readonly pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | undefined;
  readonly onPageChange?: (page: number) => void;
  readonly onDelete?: (product: Product) => void;
}

export function ProductList({
  products,
  isLoading = false,
  pagination,
  onPageChange,
  onDelete,
}: ProductListProps): React.ReactElement {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (product: Product): void => {
    if (onDelete) {
      setDeletingId(product.id);
      onDelete(product);
      // Reset after a delay (parent component should handle actual deletion)
      setTimeout(() => setDeletingId(null), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="size-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Bắt đầu bằng cách tạo sản phẩm đầu tiên của bạn.
        </p>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4 mr-2" />
            Tạo sản phẩm mới
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrls?.[0] ? (
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="size-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="size-16 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  {product.sku && (
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.sku}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatPrice(product.priceInt)}
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="outline">{product.category.name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Không có
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.stock > 0 ? "default" : "destructive"}
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="size-4" />
                        <span className="sr-only">Chỉnh sửa</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {products.length} trong tổng số {pagination.total} sản
            phẩm
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page > 1 && onPageChange) {
                      onPageChange(pagination.page - 1);
                    }
                  }}
                  className={
                    pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  const current = pagination.page;
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= current - 1 && page <= current + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore =
                    index > 0 && array[index - 1] !== page - 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onPageChange) {
                              onPageChange(page);
                            }
                          }}
                          isActive={page === pagination.page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  );
                })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      pagination.page < pagination.totalPages &&
                      onPageChange
                    ) {
                      onPageChange(pagination.page + 1);
                    }
                  }}
                  className={
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

