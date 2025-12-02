/**
 * Edit Product Page
 * Page for editing an existing product (Admin)
 */

"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/features/products/components/admin/product-form";
import {
  useAdminProduct,
  useUpdateProduct,
} from "@/features/products/hooks/use-admin-products";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { ProductFormValues } from "@/features/products/schemas/product-form.schema";
import type {
  AdminUpdateProductRequest,
} from "@/types/product.types";

export default function EditProductPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading: isLoadingProduct } = useAdminProduct(
    productId,
  );
  const updateProduct = useUpdateProduct();
  const { categories: categoriesData } = useCategories();

  const handleSubmit = async (
    data: ProductFormValues,
  ): Promise<void> => {
    // Transform form data to API request format
    // Only include fields that are provided (partial update)
    const request: AdminUpdateProductRequest = {
      name: data.name,
      priceInt: data.priceInt,
    };

    // Only include optional fields if they have values
    if (data.description !== null && data.description !== undefined && data.description !== "") {
      request.description = data.description;
    }
    if (data.categoryId !== null && data.categoryId !== undefined) {
      request.categoryId = data.categoryId;
    }
    if (data.image !== null && data.image !== undefined) {
      request.image = data.image;
    }
    if (data.tryOnImage !== null && data.tryOnImage !== undefined) {
      request.tryOnImage = data.tryOnImage;
    }
    if (data.sku !== null && data.sku !== undefined && data.sku !== "") {
      request.sku = data.sku;
    }
    if (data.slug !== null && data.slug !== undefined && data.slug !== "") {
      request.slug = data.slug;
    }
    if (data.stock !== null && data.stock !== undefined) {
      request.stock = data.stock;
    }
    if (data.model3dUrl !== null && data.model3dUrl !== undefined && data.model3dUrl !== "") {
      request.model3dUrl = data.model3dUrl;
    }

    await updateProduct.mutateAsync({
      id: productId,
      data: request,
    });
    router.push("/admin/products");
  };

  const handleCancel = (): void => {
    router.push("/admin/products");
  };

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => router.push("/admin/products")} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin sản phẩm: {product.name}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            product={product}
            mode="edit"
            categories={categoriesData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateProduct.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

