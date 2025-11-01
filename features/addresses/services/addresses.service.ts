/**
 * Addresses Service
 * API integration for shipping addresses
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/types";

export const addressesApi = {
  async getAll(): Promise<Address[]> {
    return apiGet<Address[]>("/addresses");
  },

  async getById(addressId: string): Promise<Address> {
    return apiGet<Address>(`/addresses/${addressId}`);
  },

  async create(data: CreateAddressRequest): Promise<Address> {
    return apiPost<Address>("/addresses", data);
  },

  async update(
    addressId: string,
    data: UpdateAddressRequest,
  ): Promise<Address> {
    return apiPatch<Address>(`/addresses/${addressId}`, data);
  },

  async delete(addressId: string): Promise<void> {
    return apiDelete(`/addresses/${addressId}`);
  },

  async setDefault(addressId: string): Promise<Address> {
    return apiPatch<Address>(`/addresses/${addressId}/default`, {});
  },
};
