"use client"

import type { JSX } from "react"
import { ProductFilters } from "./product-filters"
import type { Category } from "@/types"

interface ProductFiltersSidebarProps {
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  defaultPriceRange: [number, number]
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  categories: Category[]
  categoriesLoading: boolean
  onClearAll: () => void
}

export function ProductFiltersSidebar({
  priceRange,
  onPriceRangeChange,
  defaultPriceRange,
  selectedCategories,
  onCategoriesChange,
  categories,
  categoriesLoading,
  onClearAll,
}: ProductFiltersSidebarProps): JSX.Element {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-4 space-y-4 rounded-lg border bg-card p-4">
        <ProductFilters
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          defaultPriceRange={defaultPriceRange}
          selectedCategories={selectedCategories}
          onCategoriesChange={onCategoriesChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onClearAll={onClearAll}
        />
      </div>
    </aside>
  )
}

