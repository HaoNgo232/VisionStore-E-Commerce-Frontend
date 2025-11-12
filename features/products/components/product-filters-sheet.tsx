"use client"

import { useState } from "react"
import type { JSX } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProductFilters } from "./product-filters"
import { Filter } from "lucide-react"
import type { Category } from "@/types"

interface ProductFiltersSheetProps {
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  defaultPriceRange: [number, number]
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  categories: Category[]
  categoriesLoading: boolean
  onClearAll: () => void
  activeFiltersCount: number
}

export function ProductFiltersSheet({
  priceRange,
  onPriceRangeChange,
  defaultPriceRange,
  selectedCategories,
  onCategoriesChange,
  categories,
  categoriesLoading,
  onClearAll,
  activeFiltersCount,
}: ProductFiltersSheetProps): JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Bộ lọc
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
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
      </SheetContent>
    </Sheet>
  )
}

