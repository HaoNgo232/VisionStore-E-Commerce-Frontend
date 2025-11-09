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

export const addressesApi = {
  async getAll(): Promise<Address[]> {
    return apiGetValidated<Address[]>("/addresses", AddressArraySchema);
  },

  async getById(addressId: string): Promise<Address> {
    return apiGetValidated<Address>(
      `/addresses/${addressId}`,
      AddressSchema as z.ZodType<Address>,
    );
  },

  async create(data: CreateAddressRequest): Promise<Address> {
    return apiPostValidated<Address, CreateAddressRequest>(
      "/addresses",
      AddressSchema as z.ZodType<Address>,
      data,
    );
  },

  async update(
    addressId: string,
    data: UpdateAddressRequest,
  ): Promise<Address> {
    return apiPutValidated<Address, UpdateAddressRequest>(
      `/addresses/${addressId}`,
      AddressSchema as z.ZodType<Address>,
      data,
    );
  },

  async delete(addressId: string): Promise<void> {
    return apiDelete<void>(`/addresses/${addressId}`);
  },

  async setDefault(addressId: string): Promise<Address> {
    return apiPatchValidated<Address, Record<string, never>>(
      `/addresses/${addressId}/default`,
      AddressSchema as z.ZodType<Address>,
      {},
    );
  },
};
