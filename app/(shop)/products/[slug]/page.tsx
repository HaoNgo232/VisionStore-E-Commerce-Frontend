import { ProductDetailContent } from "@/features/products/components/product-detail-content";
import type { JSX } from "react";
import { Suspense } from "react";

interface ProductDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ProductDetailContent productSlug={slug} />
    </Suspense>
  );
}