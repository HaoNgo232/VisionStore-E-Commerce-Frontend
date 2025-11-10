/**
 * Product Form Component
 * Reusable form for creating and editing products (Admin)
 */

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProductImageUpload } from "./product-image-upload";
import {
    productFormSchema,
    type ProductFormValues,
} from "../../schemas/product-form.schema";
import type { Product, Category } from "@/types";
import { formatPrice } from "../../utils";

interface ProductFormProps {
    readonly product?: Product | null; // For edit mode
    readonly categories?: Category[];
    readonly onSubmit: (data: ProductFormValues) => Promise<void>;
    readonly onCancel?: () => void;
    readonly isLoading?: boolean;
    readonly mode?: "create" | "edit";
}

export function ProductForm({
    product,
    categories = [],
    onSubmit,
    onCancel,
    isLoading = false,
    mode = "create",
}: ProductFormProps): React.ReactElement {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            priceInt: 0,
            description: "",
            categoryId: null,
            image: null,
            sku: null,
            slug: null,
            stock: null,
            model3dUrl: null,
        },
    });

    // Pre-populate form for edit mode
    useEffect(() => {
        if (product && mode === "edit") {
            form.reset({
                name: product.name,
                priceInt: product.priceInt,
                description: product.description ?? "",
                categoryId: product.categoryId ?? null,
                image: null, // Don't pre-populate file input
                sku: product.sku ?? null,
                slug: product.slug ?? null,
                stock: product.stock ?? null,
                model3dUrl: product.model3dUrl ?? null,
            });
        }
    }, [product, mode, form, categories]);

    const handleSubmit = (data: ProductFormValues): void => {
        void onSubmit(data);
    };

    return (
        <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Product Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên sản phẩm *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tên sản phẩm"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Price */}
                <FormField
                    control={form.control}
                    name="priceInt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Giá sản phẩm (VND) *</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Nhập giá sản phẩm"
                                    {...field}
                                    onChange={(e) => {
                                        const value = Number.parseInt(e.target.value, 10);
                                        field.onChange(Number.isNaN(value) ? 0 : value);
                                    }}
                                    value={field.value || ""}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                Giá hiện tại: {formatPrice(field.value || 0)}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category */}
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => {
                        // Convert field.value to string for Select component
                        // Use "__none__" as placeholder when value is null/undefined
                        const selectValue = field.value ? String(field.value) : "__none__";

                        return (
                            <FormItem>
                                <FormLabel>Danh mục</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        // Convert "__none__" to null, otherwise use the value
                                        field.onChange(value === "__none__" ? null : value);
                                    }}
                                    value={selectValue}
                                    disabled={isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="__none__">Không có danh mục</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập mô tả sản phẩm"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isLoading}
                                    rows={4}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Image Upload */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Hình ảnh {mode === "create" && "*"}
                            </FormLabel>
                            <FormControl>
                                <ProductImageUpload
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    previewUrl={
                                        mode === "edit" && product?.imageUrls?.[0]
                                            ? product.imageUrls[0]
                                            : null
                                    }
                                    error={form.formState.errors.image?.message ?? undefined}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                {mode === "create"
                                    ? "Chọn ảnh sản phẩm (bắt buộc)"
                                    : "Chọn ảnh mới để thay thế ảnh hiện tại (tùy chọn)"}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* SKU */}
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập mã SKU"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Stock */}
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số lượng tồn kho</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Nhập số lượng"
                                    {...field}
                                    onChange={(e) => {
                                        const value = Number.parseInt(e.target.value, 10);
                                        field.onChange(Number.isNaN(value) ? null : value);
                                    }}
                                    value={field.value ?? ""}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Model 3D URL */}
                <FormField
                    control={form.control}
                    name="model3dUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL mô hình 3D</FormLabel>
                            <FormControl>
                                <Input
                                    type="url"
                                    placeholder="https://example.com/model.glb"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {(() => {
                            if (isLoading) {
                                return "Đang lưu...";
                            }
                            return mode === "create" ? "Tạo sản phẩm" : "Cập nhật sản phẩm";
                        })()}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

