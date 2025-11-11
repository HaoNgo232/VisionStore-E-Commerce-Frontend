/**
 * Addresses Service
 * API integration for shipping addresses with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
  apiPutValidated,
} from "@/lib/api-client";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/types";
import { AddressSchema } from "@/types";
import { z } from "zod";

// Type assertion needed because AddressSchema uses z.preprocess for createdAt
// which creates ZodEffects with unknown input type, but we know it validates Address correctly
const AddressArraySchema = z.array(AddressSchema) as z.ZodType<Address[]>;

/**
 * Interface for Addresses Service
 * Defines contract for shipping address management operations
 */
export interface IAddressesService {
  /**
   * Get all addresses for current user
   */
  getAll(): Promise<Address[]>;

  /**
   * Get address by ID
   */
  getById(addressId: string): Promise<Address>;

  /**
   * Create new address
   */
  create(data: CreateAddressRequest): Promise<Address>;

  /**
   * Update address
   */
  update(addressId: string, data: UpdateAddressRequest): Promise<Address>;

  /**
   * Delete address
   */
  delete(addressId: string): Promise<void>;

  /**
   * Set address as default
   */
  setDefault(addressId: string): Promise<Address>;
}

/**
 * Addresses Service Implementation
 * Handles shipping address management with runtime validation
 */
export class AddressesService implements IAddressesService {
  /**
   * Get all addresses for current user
   */
  async getAll(): Promise<Address[]> {
    return apiGetValidated<Address[]>("/addresses", AddressArraySchema);
  }

  /**
   * Get address by ID
   */
  async getById(addressId: string): Promise<Address> {
    return apiGetValidated<Address>(
      `/addresses/${addressId}`,
      AddressSchema as z.ZodType<Address>,
    );
  }

  /**
   * Create new address
   */
  async create(data: CreateAddressRequest): Promise<Address> {
    return apiPostValidated<Address, CreateAddressRequest>(
      "/addresses",
      AddressSchema as z.ZodType<Address>,
      data,
    );
  }

  /**
   * Update address
   */
  async update(
    addressId: string,
    data: UpdateAddressRequest,
  ): Promise<Address> {
    return apiPutValidated<Address, UpdateAddressRequest>(
      `/addresses/${addressId}`,
      AddressSchema as z.ZodType<Address>,
      data,
    );
  }

  /**
   * Delete address
   */
  async delete(addressId: string): Promise<void> {
    return apiDelete<void>(`/addresses/${addressId}`);
  }

  /**
   * Set address as default
   */
  async setDefault(addressId: string): Promise<Address> {
    return apiPatchValidated<Address, Record<string, never>>(
      `/addresses/${addressId}/default`,
      AddressSchema as z.ZodType<Address>,
      {},
    );
  }
}

/**
 * Default instance of AddressesService
 * Export singleton instance for backward compatibility
 */
export const addressesApi = new AddressesService();
