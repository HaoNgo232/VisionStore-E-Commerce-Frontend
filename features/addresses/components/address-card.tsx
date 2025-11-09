"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Address } from "@/types"
import { MapPin, Edit, Trash2 } from "lucide-react"

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => Promise<void>
  isDeleting?: boolean
}

export function AddressCard({ address, onEdit, onDelete, isDeleting }: AddressCardProps): JSX.Element {
  return (
    <Card className={address.isDefault ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold">{address.fullName}</p>
          </div>
          {address.isDefault && <Badge variant="default">Mặc định</Badge>}
        </div>

        <div className="text-sm text-muted-foreground space-y-1 mb-4">
          <p>{address.phone}</p>
          <p>{address.street}</p>
          <p>
            {address.ward}, {address.district}
          </p>
          <p>{address.city}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(address)}
            disabled={isDeleting}
          >
            <Edit className="mr-1 h-3 w-3" />
            Chỉnh sửa
          </Button>
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onDelete(address.id)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Xoá
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
