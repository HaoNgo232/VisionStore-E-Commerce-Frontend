/**
 * AddressSelector Component
 * Displays list of shipping addresses for user selection
 */

"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { Address } from "@/types"
import type { JSX } from "react"

interface AddressSelectorProps {
    addresses: Address[]
    selectedAddressId: string
    onSelectAddress: (addressId: string) => void
}

export function AddressSelector({
    addresses,
    selectedAddressId,
    onSelectAddress,
}: Readonly<AddressSelectorProps>): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedAddressId} onValueChange={onSelectAddress}>
                    <div className="space-y-3">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                data-testid="address-option"
                            >
                                <RadioGroupItem
                                    value={address.id}
                                    id={address.id}
                                    className="mt-1"
                                />
                                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                                    <div className="font-semibold">{address.fullName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {address.street}, {address.ward}, {address.district}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {address.city} • {address.phone}
                                    </div>
                                    {address.isDefault && (
                                        <div className="text-xs text-primary font-medium mt-1">
                                            Địa chỉ mặc định
                                        </div>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
                <Link
                    href="/profile?tab=addresses"
                    className="text-primary hover:underline text-sm mt-4 inline-block"
                >
                    Quản lý địa chỉ
                </Link>
            </CardContent>
        </Card>
    )
}

