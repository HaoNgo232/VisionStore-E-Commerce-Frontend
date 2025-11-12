/**
 * OrderSummary Component
 * Displays order items with product details and quantities
 */

"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/features/products/utils"
import type { Cart } from "@/types"
import type { JSX } from "react"

interface OrderSummaryProps {
    cart: Cart
}

export function OrderSummary({ cart }: Readonly<OrderSummaryProps>): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between pb-3 border-b last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <Image
                                    src={item.product?.imageUrls[0] ?? "/placeholder.svg"}
                                    alt={item.product?.name ?? "Sản phẩm"}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded object-cover"
                                />
                                <div>
                                    <p className="font-medium">{item.product?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Số lượng: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <p className="font-semibold">
                                {formatPrice((item.product?.priceInt ?? 0) * item.quantity)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

