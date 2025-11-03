"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { formatPrice } from "@/features/products/utils"

interface CartSummaryProps {
  total: number
  itemCount: number
  onCheckout?: () => void
  showCheckoutButton?: boolean
  isLoading?: boolean
}

export function CartSummary({
  total,
  itemCount,
  onCheckout,
  showCheckoutButton = true,
  isLoading = false,
}: CartSummaryProps) {
  const shippingFree = true // Free shipping for now
  const subtotal = total
  const shipping = shippingFree ? 0 : 0
  const finalTotal = total + shipping

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Số lượng</span>
          <span className="font-medium">{itemCount} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Vận chuyển</span>
          <span className="font-medium">{shippingFree ? "Miễn phí" : formatPrice(shipping) + ""}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-bold">{formatPrice(finalTotal)}</span>
        </div>
      </CardContent>
      {showCheckoutButton && (
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={onCheckout}
            disabled={isLoading || itemCount === 0}
          >
            Thanh toán
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
