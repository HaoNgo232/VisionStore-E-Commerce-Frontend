/**
 * Address Types
 * Shipping addresses and related types
 */

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
