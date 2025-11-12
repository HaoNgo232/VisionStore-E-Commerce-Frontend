"use client"

import { useState, useEffect } from "react"
import type { JSX } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface ProductSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ProductSearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm sản phẩm...",
}: ProductSearchBarProps): JSX.Element {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 300)

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = (): void => {
    setLocalValue("")
    onChange("")
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Xóa tìm kiếm</span>
        </Button>
      )}
    </div>
  )
}

