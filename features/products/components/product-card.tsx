"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Eye, Package, Palette } from "lucide-react"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Card className="group overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
          <Link href={`/products/${product.id}`}>
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {product.originalPrice && (
                <Badge className="absolute top-2 right-2" variant="destructive">
                  Sale
                </Badge>
              )}
              {!product.inStock && (
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Out of Stock
                </Badge>
              )}
            </div>
          </Link>
          <CardContent className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-balance group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              disabled={!product.inStock}
              onClick={(e) => {
                e.preventDefault()
                onAddToCart?.(product.id)
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </CardFooter>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">{product.name}</h4>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>

            {product.frameType && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Frame:</span>
                <span className="font-medium capitalize">{product.frameType}</span>
              </div>
            )}

            {product.color && (
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: product.color.toLowerCase() }}
                    title={product.color}
                  />
                  <span className="font-medium capitalize">{product.color}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
            {product.inStock && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onAddToCart?.(product.id)
                }}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
