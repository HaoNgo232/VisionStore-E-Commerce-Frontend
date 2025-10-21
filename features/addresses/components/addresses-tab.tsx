"use client"

import { useState } from "react"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { AddressCard } from "./address-card"
import { AddressFormDialog } from "./address-form-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import type { Address } from "@/types"

export function AddressesTab() {
    const userId = "user-1" // TODO: Get from auth context
    const {
        addresses,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    } = useAddresses(userId)

    const [addressDialogOpen, setAddressDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address)
        setAddressDialogOpen(true)
    }

    const handleAddAddress = () => {
        setEditingAddress(null)
        setAddressDialogOpen(true)
    }

    const handleSaveAddress = async (address: Omit<Address, "id"> | Address) => {
        if ("id" in address) {
            await updateAddress(address.id, address)
        } else {
            await addAddress(address)
        }
    }

    const handleDeleteAddress = async (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            await deleteAddress(id)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Shipping Addresses</CardTitle>
                            <CardDescription>Manage your delivery addresses</CardDescription>
                        </div>
                        <Button onClick={handleAddAddress}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Address
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
                            <p className="mt-4 text-lg font-medium">No addresses saved</p>
                            <p className="text-sm text-muted-foreground mt-2">Add an address for faster checkout</p>
                            <Button className="mt-4" onClick={handleAddAddress}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Address
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
                                    onSetDefault={setDefaultAddress}
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