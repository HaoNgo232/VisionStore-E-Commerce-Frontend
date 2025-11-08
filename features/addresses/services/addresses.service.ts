/**
 * Addresses Service
 * API integration for shipping addresses with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
} from "@/lib/api-client";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/types";
import { AddressSchema } from "@/types";
import { z } from "zod";

const AddressArraySchema: z.ZodType<Address[]> = z.array(AddressSchema);

export const addressesApi = {
  async getAll(): Promise<Address[]> {
    return apiGetValidated<Address[]>("/addresses", AddressArraySchema);
  },

  async getById(addressId: string): Promise<Address> {
    return apiGetValidated<Address>(`/addresses/${addressId}`, AddressSchema);
  },

  async create(data: CreateAddressRequest): Promise<Address> {
    return apiPostValidated<Address, CreateAddressRequest>(
      "/addresses",
      AddressSchema,
      data,
    );
  },

  async update(
    addressId: string,
    data: UpdateAddressRequest,
  ): Promise<Address> {
    return apiPatchValidated<Address, UpdateAddressRequest>(
      `/addresses/${addressId}`,
      AddressSchema,
      data,
    );
  },

  async delete(addressId: string): Promise<void> {
    return apiDelete<void>(`/addresses/${addressId}`);
  },

  async setDefault(addressId: string): Promise<Address> {
    return apiPatchValidated<Address, Record<string, never>>(
      `/addresses/${addressId}/default`,
      AddressSchema,
      {},
    );
  },
};
