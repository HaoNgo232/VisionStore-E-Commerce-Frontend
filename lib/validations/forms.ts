import * as z from "zod";

// Checkout form schema
export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s()-]+$/, "Số điện thoại không hợp lệ"),
  addressLine1: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Tên thành phố không hợp lệ"),
  state: z.string().min(2, "Tên tỉnh/bang không hợp lệ"),
  postalCode: z.string().min(4, "Mã bưu điện không hợp lệ"),
  country: z.string().min(2, "Quốc gia không hợp lệ"),
  paymentMethod: z.enum([
    "credit-card",
    "debit-card",
    "paypal",
    "cash-on-delivery",
  ]),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  subject: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Address form schema
export const addressFormSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s()-]+$/, "Số điện thoại không hợp lệ"),
  street: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  ward: z.string().min(2, "Tên phường/xã không hợp lệ"),
  district: z.string().min(2, "Tên quận/huyện không hợp lệ"),
  city: z.string().min(2, "Tên thành phố không hợp lệ"),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
