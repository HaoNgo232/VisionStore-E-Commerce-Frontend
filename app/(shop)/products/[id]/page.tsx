"use client"

import { use } from "react"
import { ProductDetailContent } from "@/features/products/components/product-detail-content"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <ProductDetailContent productId={resolvedParams.id} />
}