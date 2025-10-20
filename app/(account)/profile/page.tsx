"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { OrderCard } from "@/features/orders/components/order-card"
import { AddressCard } from "@/features/addresses/components/address-card"
import { AddressFormDialog } from "@/features/addresses/components/address-form-dialog"
import { Package, MapPin, User, Plus } from "lucide-react"
import type { Address } from "@/types"

export default function ProfilePage() {
  const userId = "user-1" // TODO: Get from auth context
  const { orders, loading: ordersLoading } = useOrders(userId)
  const {
    addresses,
    loading: addressesLoading,
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
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your orders and account settings</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="mr-2 h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and track your orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Start shopping to see your orders here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-6">
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
              {addressesLoading ? (
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
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Nguyen Van A</p>
                    <p className="text-sm text-muted-foreground">user@example.com</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <p>
                    Profile management features will be available once authentication is integrated with the backend.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        address={editingAddress}
        onSave={handleSaveAddress}
      />
    </div>
  )
}
