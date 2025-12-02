/**
 * Product Selector Component
 * Displays carousel of products with try-on support
 */

"use client";

import type { JSX } from "react";
import type { ProductWithTryOn } from "@/features/ar/types/glasses-try-on.types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PackageOpen } from "lucide-react";

interface ProductSelectorProps {
  readonly products: ProductWithTryOn[];
  readonly selectedProductId?: string | null;
  readonly onSelect: (productId: string) => void;
  readonly isLoading?: boolean;
  readonly error?: Error | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductSelector({
  products,
  selectedProductId,
  onSelect,
  isLoading = false,
  error = null,
}: ProductSelectorProps): JSX.Element {
  if (isLoading) {
    const placeholders = ["loading-1", "loading-2", "loading-3"];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Đang tải sản phẩm có hỗ trợ thử kính...
          </p>
        </div>
        <div className="flex gap-3">
          {placeholders.map((item) => (
            <Skeleton key={item} className="h-36 w-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lỗi tải sản phẩm</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <Alert>
        <PackageOpen className="h-4 w-4" />
        <AlertTitle>Chưa có kính hỗ trợ thử</AlertTitle>
        <AlertDescription>
          Admin chưa upload PNG try-on lên hệ thống. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Chọn kính để thử</p>
        <p className="text-xs text-muted-foreground">
          Danh sách kính đã có ảnh PNG nền trong suốt trên MinIO
        </p>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-3">
          {products.map((product) => {
            const selected = product.id === selectedProductId;
            const imagePreview =
              product.imageUrls[0] ?? product.tryOnImageUrl ?? "";

            return (
              <Button
                key={product.id}
                type="button"
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-auto min-w-[180px] flex-1 flex-col items-start gap-2 rounded-xl border transition-all",
                  selected && "ring-2 ring-offset-2 ring-primary"
                )}
                aria-pressed={selected}
                aria-label={`Chọn kính ${product.name} để thử`}
                onClick={() => {
                  onSelect(product.id);
                }}
              >
                <div className="w-full aspect-video overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-semibold leading-tight">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(product.priceInt)}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

