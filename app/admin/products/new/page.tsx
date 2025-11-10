/**
 * Create New Product Page
 * Page for creating a new product (Admin)
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/features/products/components/admin/product-form";
import { useCreateProduct } from "@/features/products/hooks/use-admin-products";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { ProductFormValues } from "@/features/products/schemas/product-form.schema";
import type {
  AdminCreateProductRequest,
} from "@/types/product.types";

export default function NewProductPage(): React.ReactElement {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { categories: categoriesData } = useCategories();

  const handleSubmit = async (
    data: ProductFormValues,
  ): Promise<void> => {
    // Transform form data to API request format
    // Required fields
    const request: AdminCreateProductRequest = {
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

    await createProduct.mutateAsync(request);
    router.push("/admin/products");
  };

  const handleCancel = (): void => {
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tạo sản phẩm mới</h1>
        <p className="text-muted-foreground">
          Thêm sản phẩm mới vào cửa hàng
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            mode="create"
            categories={categoriesData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createProduct.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

