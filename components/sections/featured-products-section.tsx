"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton"
import { Star, ShoppingCart } from "lucide-react"
import { productsApi } from "@/lib/api-client"
import type { Product } from "@/types"

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getFeatured().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Products</h2>
            <p className="mt-4 text-muted-foreground">Discover our most popular eyewear</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">Featured Products</h2>
          <p className="mt-4 text-muted-foreground text-pretty">Discover our most popular eyewear</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
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
                <Button size="icon" variant="outline">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
