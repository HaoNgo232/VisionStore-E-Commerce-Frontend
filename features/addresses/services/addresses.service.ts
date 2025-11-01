/**
 * Addresses Service
 * Handles all address-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { Address } from "@/types";

export const addressesApi = {
  /**
   * Fetch all addresses for a user
   */
  async getAll(userId: string): Promise<Address[]> {
    return apiGet<Address[]>(`/addresses?userId=${userId}`);
  },

  /**
   * Fetch single address by ID
   */
  async getById(id: string): Promise<Address> {
    return apiGet<Address>(`/addresses/${id}`);
  },

  /**
   * Create new address
   */
  async create(data: Omit<Address, "id">): Promise<Address> {
    return apiPost<Address>("/addresses", data);
  },

  /**
   * Update address
   */
  async update(id: string, data: Partial<Address>): Promise<Address> {
    return apiPatch<Address>(`/addresses/${id}`, data);
  },

  /**
   * Delete address
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/addresses/${id}`);
  },

  /**
   * Set default address
   */
  async setDefault(id: string): Promise<Address> {
    return apiPatch<Address>(`/addresses/${id}/default`, {});
  },
};
