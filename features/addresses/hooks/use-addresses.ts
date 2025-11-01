"use client";

import { useState, useEffect } from "react";
import type { Address } from "@/types";
import { addressesApi } from "@/features/addresses/services/addresses.service";

export function useAddresses(userId: string) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressesApi.getAll(userId);
      setAddresses(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch addresses",
      );
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, "id">) => {
    try {
      const newAddress = await addressesApi.create(address);
      setAddresses((prev) => [...prev, newAddress]);
      return newAddress;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to add address",
      );
    }
  };

  const updateAddress = async (id: string, address: Partial<Address>) => {
    try {
      const updated = await addressesApi.update(id, address);
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update address",
      );
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressesApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete address",
      );
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      // Set all addresses to non-default
      const updates = addresses.map((addr) =>
        addressesApi.update(addr.id, { isDefault: addr.id === id }),
      );
      await Promise.all(updates);

      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        })),
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to set default address",
      );
    }
  };

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
