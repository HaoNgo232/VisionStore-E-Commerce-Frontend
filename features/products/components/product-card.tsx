"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"
import type { Product } from "@/types"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = (product.priceInt / 100).toLocaleString("vi-VN")
  const inStock = product.stock > 0

  const handleAddToCart = () => {
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
    // TODO: Integrate with cart store
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
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
        <Link href={`/products/${product.id}`}>
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
          <span className="text-lg font-bold">{price}₫</span>
          {!inStock && (
            <span className="text-xs text-destructive">Hết hàng</span>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Thêm vào giỏ hàng</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
