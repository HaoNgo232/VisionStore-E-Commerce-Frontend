"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { ProductFilters as ProductFiltersType } from "@/types"

interface ProductFiltersProps {
  filters: ProductFiltersType
  onFiltersChange: (filters: Partial<ProductFiltersType>) => void
  onClearFilters: () => void
}

const categories = [
  { value: "sunglasses", label: "Sunglasses" },
  { value: "eyeglasses", label: "Eyeglasses" },
  { value: "sports", label: "Sports" },
  { value: "kids", label: "Kids" },
]

const brands = ["VisionPro", "UrbanEye", "RetroVision", "ActiveVision", "ChicVision", "JuniorVision"]

const frameTypes = [
  { value: "full-rim", label: "Full Rim" },
  { value: "semi-rimless", label: "Semi-Rimless" },
  { value: "rimless", label: "Rimless" },
  { value: "aviator", label: "Aviator" },
  { value: "wayfarer", label: "Wayfarer" },
  { value: "round", label: "Round" },
  { value: "cat-eye", label: "Cat-Eye" },
]

export function ProductFilters({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps) {
  const [minPrice, maxPrice] = filters.priceRange || [0, 200]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Category</Label>
        <RadioGroup
          value={filters.category || ""}
          onValueChange={(value) => onFiltersChange({ category: value as any })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="all" />
            <Label htmlFor="all" className="font-normal cursor-pointer">
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <RadioGroupItem value={category.value} id={category.value} />
              <Label htmlFor={category.value} className="font-normal cursor-pointer">
                {category.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Price Range</Label>
        <div className="pt-2">
          <Slider
            min={0}
            max={200}
            step={10}
            value={[minPrice, maxPrice]}
            onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
          />
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brand */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Brand</Label>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={filters.brand === brand}
                onCheckedChange={(checked) => onFiltersChange({ brand: checked ? brand : undefined })}
              />
              <Label htmlFor={brand} className="font-normal cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Frame Type */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Frame Type</Label>
        <div className="space-y-2">
          {frameTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={filters.frameType === type.value}
                onCheckedChange={(checked) => onFiltersChange({ frameType: checked ? (type.value as any) : undefined })}
              />
              <Label htmlFor={type.value} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStock || false}
          onCheckedChange={(checked) => onFiltersChange({ inStock: checked as boolean })}
        />
        <Label htmlFor="inStock" className="font-normal cursor-pointer">
          In Stock Only
        </Label>
      </div>
    </div>
  )
}
