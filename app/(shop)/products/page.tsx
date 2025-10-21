"use client"

import { useState } from "react"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCart } from "@/features/cart/context/cart-context"
import { ProductGrid } from "@/features/products/components/product-grid"
import { ProductFilters } from "@/features/products/components/product-filters"
import { ProductSort } from "@/features/products/components/product-sort"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

export default function ProductsPage() {
  const { products, loading, filters, updateFilters, clearFilters } = useProducts()
  const { addItem } = useCart()
  const [sortBy, setSortBy] = useState("featured")

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return 0 // Mock: would use createdAt in real app
      default:
        return 0
    }
  })

  const handleAddToCart = async (productId: string) => {
    await addItem(productId, 1)
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-balance">All Products</h1>
        <p className="text-muted-foreground mt-2">Discover our complete eyewear collection</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <ProductFilters filters={filters} onFiltersChange={updateFilters} onClearFilters={clearFilters} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${sortedProducts.length} products`}
            </p>

            <div className="flex items-center gap-2">
              <ProductSort value={sortBy} onChange={setSortBy} />

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <ProductFilters filters={filters} onFiltersChange={updateFilters} onClearFilters={clearFilters} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <ProductGrid products={sortedProducts} onAddToCart={handleAddToCart} />
          )}
        </div>
      </div>
    </div>
  )
}
