/**
 * Address Types
 * Shipping addresses and related types
 */

import { z } from "zod";

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
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(1),
  phone: z.string().min(10),
  street: z.string().min(1),
  ward: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
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
