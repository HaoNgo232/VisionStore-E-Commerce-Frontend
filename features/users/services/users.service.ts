/**
 * Users Service
 * API integration for user profile management
 */

import { apiGet, apiPatch } from "@/lib/api-client";
import type { User, Address } from "@/types";
import type { UpdateProfileRequest } from "@/types/user.types";

export const usersApi = {
  async getProfile(): Promise<User> {
    return apiGet<User>("/users/profile");
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiPatch<User>("/users/profile", data);
  },

  async getAddressById(addressId: string): Promise<Address> {
    return apiGet<Address>(`/addresses/${addressId}`);
  },
};
