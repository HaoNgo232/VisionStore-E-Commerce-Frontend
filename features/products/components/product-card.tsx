"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import type { Product } from "@/types"
import { useCartStore } from "@/stores/cart.store"
import { formatPrice } from "@/features/products/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const price = formatPrice(product.priceInt)
  const inStock = product.stock > 0

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrls[0] || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {!inStock && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              Hết hàng
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-balance group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-sm text-muted-foreground mt-1">{product.category.name}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold">{price}</span>
          {!inStock && (
            <span className="text-xs text-destructive">Hết hàng</span>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          disabled={!inStock || isAdding}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Thêm vào giỏ hàng</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
