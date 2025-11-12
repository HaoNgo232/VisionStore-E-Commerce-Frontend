"use client"

import type { JSX } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatPrice } from "@/features/products/utils"
import type { Category } from "@/types"

export interface ActiveFilter {
  type: "price" | "category"
  label: string
  value: string
  onRemove: () => void
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onClearAll: () => void
}

export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps): JSX.Element {
  if (filters.length === 0) {
    return <></>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Bộ lọc:</span>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          <span>{filter.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-destructive/20"
            onClick={filter.onRemove}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Xóa bộ lọc</span>
          </Button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs"
        >
          Xóa tất cả
        </Button>
      )}
    </div>
  )
}

/**
 * Helper function to create active filters from filter state
 */
export function createActiveFilters(
  priceRange: [number, number] | null,
  defaultPriceRange: [number, number],
  selectedCategories: string[],
  categories: Category[],
  onRemovePrice: () => void,
  onRemoveCategory: (slug: string) => void,
): ActiveFilter[] {
  const filters: ActiveFilter[] = []

  // Price filter
  if (
    priceRange &&
    (priceRange[0] !== defaultPriceRange[0] || priceRange[1] !== defaultPriceRange[1])
  ) {
    filters.push({
      type: "price",
      label: `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`,
      value: `price-${priceRange[0]}-${priceRange[1]}`,
      onRemove: onRemovePrice,
    })
  }

  // Category filters
  selectedCategories.forEach((slug) => {
    const category = categories.find((c) => c.slug === slug)
    if (category) {
      filters.push({
        type: "category",
        label: category.name,
        value: `category-${slug}`,
        onRemove: () => onRemoveCategory(slug),
      })
    }
  })

  return filters
}

