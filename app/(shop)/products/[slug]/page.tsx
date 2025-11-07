"use client"

import { ProductDetailContent } from "@/features/products/components/product-detail-content"

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailContent productSlug={params.slug} />
}