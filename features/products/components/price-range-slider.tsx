"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { JSX } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/features/products/utils"

interface PriceRangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  debounceMs?: number
}

export function PriceRangeSlider({
  value,
  onChange,
  min = 0,
  max = 10000000,
  step = 10000,
  debounceMs = 500,
}: PriceRangeSliderProps): JSX.Element {
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange callback
  const debouncedOnChange = useCallback(
    (newValue: [number, number]): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue)
      }, debounceMs)
    },
    [onChange, debounceMs],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleSliderChange = (newValue: number[]): void => {
    const [minVal, maxVal] = newValue as [number, number]
    setLocalValue([minVal, maxVal])
    // Debounce onChange for slider (user is dragging)
    debouncedOnChange([minVal, maxVal])
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newMin = Math.max(min, Math.min(parseInt(e.target.value) || min, localValue[1]))
    setLocalValue([newMin, localValue[1]])
    // Debounce onChange for input (user is typing)
    debouncedOnChange([newMin, localValue[1]])
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newMax = Math.min(max, Math.max(parseInt(e.target.value) || max, localValue[0]))
    setLocalValue([localValue[0], newMax])
    // Debounce onChange for input (user is typing)
    debouncedOnChange([localValue[0], newMax])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="min-price" className="text-sm">
            Từ
          </Label>
          <Input
            id="min-price"
            type="number"
            value={localValue[0]}
            onChange={handleMinInputChange}
            min={min}
            max={localValue[1]}
            step={step}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">{formatPrice(localValue[0])}</p>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="max-price" className="text-sm">
            Đến
          </Label>
          <Input
            id="max-price"
            type="number"
            value={localValue[1]}
            onChange={handleMaxInputChange}
            min={localValue[0]}
            max={max}
            step={step}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">{formatPrice(localValue[1])}</p>
        </div>
      </div>
      <Slider
        value={[localValue[0], localValue[1]]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}

