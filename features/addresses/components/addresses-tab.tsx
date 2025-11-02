"use client"

import { useState } from "react"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { AddressCard } from "./address-card"
import { AddressFormDialog } from "./address-form-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import type { Address, CreateAddressRequest } from "@/types"
import type { AddressFormValues } from "@/lib/validations/forms"

export function AddressesTab() {
    const {
        addresses,
        loading,
        create,
        update,
        remove,
    } = useAddresses()

    const [addressDialogOpen, setAddressDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address)
        setAddressDialogOpen(true)
    }

    const handleAddAddress = () => {
        setEditingAddress(null)
        setAddressDialogOpen(true)
    }

    const handleSaveAddress = async (values: AddressFormValues, isEdit: boolean) => {
        const data: CreateAddressRequest = {
            fullName: values.fullName,
            phone: values.phone,
            street: values.street,
            ward: values.ward,
            district: values.district,
            city: values.city,
            isDefault: values.isDefault,
        }

        if (isEdit && editingAddress) {
            await update(editingAddress.id, data)
        } else {
            await create(data)
        }
    }

    const handleDeleteAddress = async (id: string) => {
        setDeletingId(id)
        try {
            await remove(id)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Địa chỉ giao hàng</CardTitle>
                            <CardDescription>Quản lý các địa chỉ giao hàng của bạn</CardDescription>
                        </div>
                        <Button onClick={handleAddAddress}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm địa chỉ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">Chưa có địa chỉ nào</p>
                            <p className="text-sm text-muted-foreground mt-2">Thêm địa chỉ để thanh toán nhanh hơn</p>
                            <Button className="mt-4" onClick={handleAddAddress}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm địa chỉ
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {addresses.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    address={address}
                                    onEdit={handleEditAddress}
                                    onDelete={handleDeleteAddress}
                                    isDeleting={deletingId === address.id}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddressFormDialog
                open={addressDialogOpen}
                onOpenChange={setAddressDialogOpen}
                address={editingAddress}
                onSave={handleSaveAddress}
            />
        </>
    )
}