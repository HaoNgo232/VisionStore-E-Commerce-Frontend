"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Address } from "@/types"
import { MapPin, Edit, Trash2, Check } from "lucide-react"

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <Card className={address.isDefault ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold">{address.fullName}</p>
          </div>
          {address.isDefault && <Badge variant="default">Default</Badge>}
        </div>

        <div className="text-sm text-muted-foreground space-y-1 mb-4">
          <p>{address.phone}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          {!address.isDefault && (
            <Button variant="outline" size="sm" onClick={() => onSetDefault(address.id)}>
              <Check className="mr-1 h-3 w-3" />
              Set Default
            </Button>
          )}
          {!address.isDefault && (
            <Button variant="outline" size="sm" onClick={() => onDelete(address.id)}>
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
