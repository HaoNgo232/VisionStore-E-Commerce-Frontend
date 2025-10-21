"use client"

import { useCartStore } from "@/stores/cart.store"
import { CartItem } from "@/features/cart/components/cart-item"
import type { CartItem as CartItemType } from "@/types"
import { CartSummary } from "@/features/cart/components/cart-summary"
import { FreeShippingProgress } from "@/features/cart/components/free-shipping-progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Start shopping to add items to your cart</p>
          <Button className="mt-6" size="lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const shipping = total >= 50 ? 0 : 5.99
  const tax = total * 0.1
  const totalPrice = total + shipping + tax

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Cart Items ({itemCount})</h2>
            </div>
            <Separator />
            <div className="divide-y">
              {items.map((item: CartItemType) => (
                <div key={item.productId} className="px-6">
                  <CartItem item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button variant="ghost" onClick={() => items.forEach((item: CartItemType) => removeItem(item.productId))}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <FreeShippingProgress currentTotal={total} freeShippingThreshold={50} />
          <CartSummary subtotal={total} shipping={shipping} tax={tax} total={totalPrice} />
        </div>
      </div>
    </div>
  )
}
