"use client"

import Link from "next/link"
import type { JSX } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import type { Product } from "@/types"
import { useCartStore } from "@/stores/cart.store"
import { formatPrice } from "@/features/products/utils"

interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps): JSX.Element {
  const addItem = useCartStore((state) => state.addItem)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
        <p className="text-sm text-muted-foreground mt-2">Thử điều chỉnh bộ lọc của bạn</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} onAddToCart={addItem} />
      ))}
    </div>
  )
}

interface ProductListItemProps {
  product: Product
  onAddToCart: (productId: string, quantity: number) => Promise<void>
}

function ProductListItem({ product, onAddToCart }: ProductListItemProps): JSX.Element {
  const [isAdding, setIsAdding] = useState(false)

  const price = formatPrice(product.priceInt)
  const inStock = product.stock > 0

  const handleAddToCart = async (): Promise<void> => {
    setIsAdding(true)
    try {
      await onAddToCart(product.id, 1)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex gap-4">
        <Link href={`/products/${product.slug}`} className="shrink-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.imageUrls[0] ?? "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain transition-transform group-hover:scale-105"
            />
            {!inStock && (
              <Badge className="absolute top-2 left-2" variant="secondary">
                Hết hàng
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div className="space-y-2">
            <div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {product.category && (
                <p className="text-sm text-muted-foreground mt-1">{product.category.name}</p>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            )}
            {product.attributes?.brand && (
              <p className="text-sm text-muted-foreground">Thương hiệu: {product.attributes.brand}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{price}</span>
              {!inStock && (
                <span className="text-xs text-destructive">Hết hàng</span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!inStock || isAdding}
              onClick={() => {
                void handleAddToCart()
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

