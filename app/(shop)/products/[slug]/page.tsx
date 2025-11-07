import { ProductDetailContent } from "@/features/products/components/product-detail-content";
import { Suspense } from "react";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailContent productSlug={slug} />
    </Suspense>
  );
}