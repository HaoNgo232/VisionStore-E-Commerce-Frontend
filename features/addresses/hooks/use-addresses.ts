/**
 * useAddresses Hook
 * Fetches and manages user addresses
 */

"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api-client";
import { addressesApi } from "@/features/addresses/services/addresses.service";
import { toast } from "sonner";
import type { Address, CreateAddressRequest } from "@/types";

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressesApi.getAll();
      setAddresses(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const create = async (data: CreateAddressRequest) => {
    try {
      const newAddress = await addressesApi.create(data);
      setAddresses([...addresses, newAddress]);
      toast.success("Đã thêm địa chỉ mới");
      return newAddress;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const update = async (id: string, data: CreateAddressRequest) => {
    try {
      const updated = await addressesApi.update(id, data);
      setAddresses(addresses.map((addr) => (addr.id === id ? updated : addr)));
      toast.success("Đã cập nhật địa chỉ");
      return updated;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await addressesApi.delete(id);
      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast.success("Đã xoá địa chỉ");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  return {
    addresses,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchAddresses,
  };
}
