/**
 * PaymentMethodSelector Component
 * Displays payment method options (COD, SePay) for user selection
 */

"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethod } from "@/types"
import type { JSX } from "react"

interface PaymentMethodSelectorProps {
    selectedPayment: PaymentMethod
    onSelectPayment: (method: PaymentMethod) => void
}

/**
 * Type guard function to validate if a string is a valid PaymentMethod
 */
function isPaymentMethod(value: string): value is PaymentMethod {
    return value === PaymentMethod.COD.toString() || value === PaymentMethod.SEPAY.toString()
}

export function PaymentMethodSelector({
    selectedPayment,
    onSelectPayment,
}: Readonly<PaymentMethodSelectorProps>): JSX.Element {
    const handleChange = (value: string): void => {
        if (isPaymentMethod(value)) {
            onSelectPayment(value)
        } else {
            // Fallback to COD if invalid value
            console.warn(`Invalid payment method: ${value}, falling back to COD`)
            onSelectPayment(PaymentMethod.COD)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={handleChange}>
                    <div className="space-y-3">
                        <label
                            htmlFor="cod"
                            className="w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer bg-transparent"
                        >
                            <RadioGroupItem value={PaymentMethod.COD} id="cod" />
                            <div className="flex-1 cursor-pointer">
                                <div className="font-semibold">
                                    Thanh toán khi nhận hàng (COD)
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Thanh toán tiền mặt khi nhân viên giao hàng tới
                                </div>
                            </div>
                        </label>
                        <label
                            htmlFor="sepay"
                            className="w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer bg-transparent"
                        >
                            <RadioGroupItem value={PaymentMethod.SEPAY} id="sepay" />
                            <div className="flex-1 cursor-pointer">
                                <div className="font-semibold">
                                    Chuyển khoản ngân hàng (SePay)
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Quét mã QR để thanh toán qua ngân hàng
                                </div>
                            </div>
                        </label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    )
}

