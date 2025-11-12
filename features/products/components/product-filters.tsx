"use client"

import { useState, useMemo } from "react"
import type { JSX } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PriceRangeSlider } from "./price-range-slider"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Category } from "@/types"

interface ProductFiltersProps {
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  defaultPriceRange: [number, number]
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  categories: Category[]
  categoriesLoading: boolean
  onClearAll: () => void
}

export function ProductFilters({
  priceRange,
  onPriceRangeChange,
  defaultPriceRange,
  selectedCategories,
  onCategoriesChange,
  categories,
  categoriesLoading,
  onClearAll,
}: Readonly<ProductFiltersProps>): JSX.Element {
  const [categorySearch, setCategorySearch] = useState("")

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) { return categories }
    const searchLower = categorySearch.toLowerCase()
    return categories.filter((cat) => cat.name.toLowerCase().includes(searchLower))
  }, [categories, categorySearch])

  const handleCategoryToggle = (slug: string, checked: boolean): void => {
    if (checked) {
      onCategoriesChange([...selectedCategories, slug])
    } else {
      onCategoriesChange(selectedCategories.filter((c) => c !== slug))
    }
  }

  const hasActiveFilters =
    priceRange[0] !== defaultPriceRange[0] ||
    priceRange[1] !== defaultPriceRange[1] ||
    selectedCategories.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bộ lọc</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Xóa tất cả
          </Button>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Khoảng giá</Label>
        <PriceRangeSlider
          value={priceRange}
          onChange={onPriceRangeChange}
          min={defaultPriceRange[0]}
          max={defaultPriceRange[1]}
        />
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Danh mục</Label>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm danh mục..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {categoriesLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              ) : filteredCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không tìm thấy danh mục</p>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category.slug, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.slug}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
