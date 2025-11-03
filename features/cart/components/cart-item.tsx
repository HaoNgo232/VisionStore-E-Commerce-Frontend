"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, X } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"
import Link from "next/link"
import { useState } from "react"
import { formatPrice } from "@/features/products/utils"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>
  onRemove: (itemId: string) => Promise<void>
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [updating, setUpdating] = useState(false)
  const { quantity } = item
  const product = item.product

  if (!product) {
    return null
  }

  const price = product.priceInt
  const totalPrice = price * quantity

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemove()
      return
    }
    setUpdating(true)
    try {
      await onUpdateQuantity(item.id, newQuantity)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = async () => {
    setUpdating(true)
    try {
      await onRemove(item.id)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex gap-4 py-4 px-5">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <img
          src={product.imageUrls[0] || "/placeholder.svg"}
          alt={product.name}
          className="h-24 w-24 rounded-lg object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${product.id}`} className="font-semibold hover:text-primary transition-colors">
              {product.name}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={updating}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xoá sản phẩm</span>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantity - 1)}
              disabled={updating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-12 text-center text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={updating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              {formatPrice(totalPrice)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(price)} / cái
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
