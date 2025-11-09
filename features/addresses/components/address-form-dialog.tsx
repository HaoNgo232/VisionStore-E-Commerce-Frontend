"use client"

import { useEffect, useState } from "react"
import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Address } from "@/types"
import { addressFormSchema, type AddressFormValues } from "@/lib/validations/forms"

interface AddressFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly address?: Address | null
  readonly onSave: (values: AddressFormValues, isEdit: boolean) => Promise<void>
}

export function AddressFormDialog({ open, onOpenChange, address, onSave }: AddressFormDialogProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    },
  })

  useEffect(() => {
    if (address) {
      form.reset({
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: address.isDefault,
      })
    } else {
      form.reset({
        fullName: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
      })
    }
  }, [address, open, form])

  const onSubmit = async (values: AddressFormValues): Promise<void> => {
    setIsSubmitting(true)
    try {
      await onSave(values, !!address)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonText = (): string => {
    if (isSubmitting) {
      return "Đang lưu..."
    }
    if (address) {
      return "Cập nhật"
    }
    return "Thêm"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
          <DialogDescription>
            {address ? "Cập nhật thông tin địa chỉ giao hàng" : "Thêm một địa chỉ giao hàng mới"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }}>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người nhận *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ (Đường/Số nhà) *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Đường ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phường/Xã *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phường 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quận/Huyện *</FormLabel>
                      <FormControl>
                        <Input placeholder="Quận 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố *</FormLabel>
                    <FormControl>
                      <Input placeholder="TP Hồ Chí Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Đặt làm địa chỉ mặc định</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {getButtonText()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
