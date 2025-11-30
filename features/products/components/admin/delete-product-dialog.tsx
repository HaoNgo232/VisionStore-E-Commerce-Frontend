/**
 * Delete Product Dialog Component
 * Confirmation dialog for soft deleting products
 */

"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Product } from "@/types";

interface DeleteProductDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly product: Product | null;
    readonly onConfirm: () => Promise<void>;
    readonly isLoading?: boolean;
}

export function DeleteProductDialog({
    open,
    onOpenChange,
    product,
    onConfirm,
    isLoading = false,
}: DeleteProductDialogProps): React.ReactElement {
    const handleConfirm = async (): Promise<void> => {
        await onConfirm();
        onOpenChange(false);
    };

    const handleButtonClick = (): void => {
        void handleConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa sản phẩm{" "}
                        <span className="font-semibold">{product?.name}</span>?
                        <br />
                        <br />
                        Sản phẩm sẽ được đánh dấu là đã xóa (soft delete) và không hiển thị
                        trên store nữa, nhưng dữ liệu sẽ vẫn được lưu trữ.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleButtonClick}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? "Đang xóa..." : "Xóa sản phẩm"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

