"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductSortProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSort({ value, onChange }: ProductSortProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Nổi bật</SelectItem>
          <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
          <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
          <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
          <SelectItem value="newest">Mới nhất</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
