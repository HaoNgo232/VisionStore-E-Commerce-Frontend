import { ProductCard } from "./product-card"
import type { Product } from "@/types"

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (productId: string) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
