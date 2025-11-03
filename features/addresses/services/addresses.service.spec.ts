import { addressesApi } from "./addresses.service";
import { useAuthStore } from "@/stores/auth.store";
import * as apiClient from "@/lib/api-client";
import type { Address } from "@/types";

jest.mock("@/stores/auth.store");
jest.mock("@/lib/api-client");

describe("addressesApi", () => {
  const mockUserId = "user-123";
  const mockAddress: Address = {
    id: "addr-123",
    userId: mockUserId,
    fullName: "John Doe",
    phone: "0123456789",
    district: "District 1",
    ward: "Ward 1",
    street: "123 Main St",
    city: "Ho Chi Minh City",
    isDefault: true,
    createdAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      getUserId: jest.fn().mockReturnValue(mockUserId),
    });
  });

  describe("getAll", () => {
    it("fetches user addresses", async () => {
      const mockResponse = [mockAddress];

      (apiClient.apiGet as jest.Mock).mockResolvedValue(mockResponse);

      const result = await addressesApi.getAll();

      expect(apiClient.apiGet).toHaveBeenCalledWith("/addresses");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getById", () => {
    it("fetches address by id", async () => {
      (apiClient.apiGet as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressesApi.getById("addr-123");

      expect(apiClient.apiGet).toHaveBeenCalledWith("/addresses/addr-123");
      expect(result).toEqual(mockAddress);
    });
  });

  describe("create", () => {
    it("creates address", async () => {
      const createData = {
        fullName: "John Doe",
        phone: "0123456789",
        street: "123 Main St",
        ward: "Ward 1",
        district: "District 1",
        city: "Ho Chi Minh City",
        isDefault: false,
      };

      (apiClient.apiPost as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressesApi.create(createData);

      expect(apiClient.apiPost).toHaveBeenCalledWith("/addresses", createData);
      expect(result).toEqual(mockAddress);
    });
  });

  describe("update", () => {
    it("updates address", async () => {
      const updateData = { isDefault: false };
      const updatedAddress = { ...mockAddress, isDefault: false };

      (apiClient.apiPatch as jest.Mock).mockResolvedValue(updatedAddress);

      const result = await addressesApi.update("addr-123", updateData);

      expect(apiClient.apiPatch).toHaveBeenCalledWith(
        "/addresses/addr-123",
        updateData,
      );
      expect(result).toEqual(updatedAddress);
    });
  });

  describe("delete", () => {
    it("deletes address", async () => {
      (apiClient.apiDelete as jest.Mock).mockResolvedValue(undefined);

      const result = await addressesApi.delete("addr-123");

      expect(apiClient.apiDelete).toHaveBeenCalledWith("/addresses/addr-123");
      expect(result).toBeUndefined();
    });
  });

  describe("setDefault", () => {
    it("sets address as default", async () => {
      (apiClient.apiPatch as jest.Mock).mockResolvedValue(mockAddress);

      const result = await addressesApi.setDefault("addr-123");

      expect(apiClient.apiPatch).toHaveBeenCalledWith(
        "/addresses/addr-123/default",
        {},
      );
      expect(result).toEqual(mockAddress);
    });
  });
});
