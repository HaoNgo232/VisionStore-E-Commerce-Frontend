"use client"

import { useCart } from "@/features/cart/context/cart-context"
import { CartItem } from "@/features/cart/components/cart-item"
import { CartSummary } from "@/features/cart/components/cart-summary"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart()

  if (cart.items.length === 0) {
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

  const shipping = cart.total >= 50 ? 0 : 5.99
  const tax = cart.total * 0.1
  const total = cart.total + shipping + tax

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Cart Items ({cart.itemCount})</h2>
            </div>
            <Separator />
            <div className="divide-y">
              {cart.items.map((item) => (
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
            <Button variant="ghost" onClick={() => cart.items.forEach((item) => removeItem(item.productId))}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div>
          <CartSummary subtotal={cart.total} shipping={shipping} tax={tax} total={total} />

          {cart.total < 50 && (
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Add ${(50 - cart.total).toFixed(2)} more for free shipping
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
