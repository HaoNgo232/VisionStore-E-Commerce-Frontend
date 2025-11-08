/**
 * Address Types
 * Shipping addresses and related types
 */

import { z } from "zod";
import { cuidSchema } from "./common.types";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Zod schema for Address
 */
export const AddressSchema = z.object({
  id: cuidSchema(), // Backend uses CUID, not UUID
  userId: cuidSchema(), // Backend uses CUID, not UUID
  fullName: z.string().min(1),
  phone: z.string().min(10),
  street: z.string().min(1),
  ward: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  isDefault: z.boolean(),
  createdAt: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    return String(val);
  }, z.string()),
});

/**
 * Create address request
 */
export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

/**
 * Update address request
 */
export interface UpdateAddressRequest {
  fullName?: string;
  phone?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
}

/**
 * Address suggestion from API
 */
export interface AddressSuggestion {
  street: string;
  ward: string;
  district: string;
  city: string;
}
