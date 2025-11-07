"use client"

import { use } from "react"
import { ProductDetailContent } from "@/features/products/components/product-detail-content"

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  return <ProductDetailContent productSlug={resolvedParams.slug} />
}