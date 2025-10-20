"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">Thank you for your purchase. Your order has been received.</p>
            {orderId && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="text-lg font-semibold">{orderId}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We've sent a confirmation email with your order details. You can track your order from your profile page.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href="/profile">View Orders</Link>
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
