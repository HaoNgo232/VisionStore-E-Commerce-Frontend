/**
 * Product Form Schema
 * Zod validation schema for admin product create/edit forms
 */

import { z } from "zod";
import { cuidSchema } from "@/types";

/**
 * File validation helper
 * Validates image file type and size
 */
const imageFileSchema = z
  .instanceof(File, { message: "Vui lòng chọn một file ảnh" })
  .refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    "Kích thước file không được vượt quá 5MB",
  )
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP",
  );

/**
 * File validation helper for try-on PNG images
 * Validates PNG type and size (up to 20MB to match backend limit)
 */
const tryOnImageFileSchema = z
  .instanceof(File, { message: "Vui lòng chọn một file PNG" })
  .refine(
    (file) => file.size <= 20 * 1024 * 1024, // 20MB
    "Kích thước file thử kính không được vượt quá 20MB",
  )
  .refine(
    (file) => file.type === "image/png",
    "Chỉ chấp nhận file PNG với nền trong suốt cho ảnh thử kính",
  );

/**
 * Product form schema for create/edit
 * Supports optional image upload
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự"),

  priceInt: z
    .number({
      required_error: "Giá sản phẩm là bắt buộc",
      invalid_type_error: "Giá sản phẩm phải là số",
    })
    .int("Giá sản phẩm phải là số nguyên")
    .positive("Giá sản phẩm phải lớn hơn 0")
    .min(1000, "Giá sản phẩm tối thiểu là 1,000 VND"),

  description: z
    .string()
    .max(5000, "Mô tả không được vượt quá 5000 ký tự")
    .optional()
    .nullable(),

  categoryId: cuidSchema().optional().nullable(),

  image: imageFileSchema.optional().nullable(),

  // Optional try-on PNG image for AR feature
  tryOnImage: tryOnImageFileSchema.optional().nullable(),

  // Optional fields for future expansion
  sku: z
    .string()
    .max(100, "SKU không được vượt quá 100 ký tự")
    .optional()
    .nullable(),

  slug: z
    .string()
    .max(200, "Slug không được vượt quá 200 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    )
    .optional()
    .nullable(),

  stock: z
    .number()
    .int("Số lượng tồn kho phải là số nguyên")
    .nonnegative("Số lượng tồn kho không được âm")
    .optional()
    .nullable(),

  model3dUrl: z
    .string()
    .url("URL mô hình 3D không hợp lệ")
    .optional()
    .nullable(),
});

/**
 * Product form schema for create (image required)
 */
export const createProductFormSchema = productFormSchema.extend({
  image: imageFileSchema, // Required for create
});

/**
 * Product form schema for update (all fields optional except image)
 */
export const updateProductFormSchema = productFormSchema.partial().extend({
  name: z
    .string()
    .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự")
    .optional(),

  priceInt: z
    .number()
    .int("Giá sản phẩm phải là số nguyên")
    .positive("Giá sản phẩm phải lớn hơn 0")
    .min(1000, "Giá sản phẩm tối thiểu là 1,000 VND")
    .optional(),
});

// Type inference
export type ProductFormValues = z.infer<typeof productFormSchema>;
export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductFormSchema>;
