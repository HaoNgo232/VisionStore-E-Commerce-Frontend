/**
 * CheckoutActions Component
 * Displays order summary sidebar with total and checkout button
 */

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/features/products/utils"
import type { JSX } from "react"

interface CheckoutActionsProps {
    total: number
    isSubmitting: boolean
    isDisabled: boolean
    onCheckout: () => void
}

export function CheckoutActions({
    total,
    isSubmitting,
    isDisabled,
    onCheckout,
}: Readonly<CheckoutActionsProps>): JSX.Element {
    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                </div>

                <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={onCheckout}
                    disabled={isSubmitting || isDisabled}
                >
                    {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                    <Link href="/cart">Quay lại giỏ hàng</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

