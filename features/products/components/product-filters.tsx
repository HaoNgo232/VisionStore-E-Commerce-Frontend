"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatPrice } from "@/features/products/utils"
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

export function ProductFilters({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps): JSX.Element {
  const [minPrice, maxPrice] = filters.priceRange || [0, 200]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "brand"]} className="w-full">
        {/* Category */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filters.categoryId || ""}
              onValueChange={(value) => onFiltersChange({ categoryId: value })}
              className="space-y-3"
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
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-4">
              <Slider
                min={0}
                max={2000000} // 2,000,000 VND
                step={50000} // 50,000 VND steps
                value={[minPrice, maxPrice]}
                onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand}
                    disabled
                  />
                  <Label htmlFor={brand} className="font-normal cursor-pointer text-muted-foreground">
                    {brand} (Coming soon)
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Frame Type */}
        <AccordionItem value="frame">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Frame Type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {frameTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    disabled
                  />
                  <Label htmlFor={type.value} className="font-normal cursor-pointer text-muted-foreground">
                    {type.label} (Coming soon)
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* In Stock */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                disabled
              />
              <Label htmlFor="inStock" className="font-normal cursor-pointer text-muted-foreground">
                In Stock Only (Coming soon)
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
