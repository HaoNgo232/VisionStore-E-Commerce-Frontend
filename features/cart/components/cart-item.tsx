"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, X } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"
import Link from "next/link"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <div className="flex gap-4 py-4">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <img
          src={product.images[0] || "/placeholder.svg"}
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
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onRemove(product.id)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-12 text-center text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold">${(product.price * quantity).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">${product.price} each</p>
          </div>
        </div>
      </div>
    </div>
  )
}
