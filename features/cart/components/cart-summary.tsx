"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface CartSummaryProps {
  subtotal: number
  shipping?: number
  tax?: number
  total: number
  onCheckout?: () => void
  showCheckoutButton?: boolean
}

export function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  total,
  onCheckout,
  showCheckoutButton = true,
}: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold">Total</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
      </CardContent>
      {showCheckoutButton && (
        <CardFooter>
          <Button className="w-full" size="lg" onClick={onCheckout} asChild>
            <Link href="/cart/checkout">Proceed to Checkout</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
