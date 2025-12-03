import { addressesApi } from "./addresses.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Address } from "@/types";

jest.mock("@/stores/auth.store");

// Mock dependencies
const mockApiGetValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiPostValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiPutValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiPatchValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiDelete = jest.fn<Promise<unknown>, unknown[]>();

jest.mock("@/lib/api-client", () => ({
  apiGetValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiGetValidated(...args),
  apiPostValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPostValidated(...args),
  apiPutValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPutValidated(...args),
  apiPatchValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPatchValidated(...args),
  apiDelete: (...args: unknown[]): Promise<unknown> => mockApiDelete(...args),
}));

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("fetches user addresses", async () => {
      const mockResponse = [mockAddress];

      mockApiGetValidated.mockResolvedValue(mockResponse);

      const result = await addressesApi.getAll();

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        "/addresses",
        expect.anything(), // schema
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getById", () => {
    it("fetches address by id", async () => {
      mockApiGetValidated.mockResolvedValue(mockAddress);

      const result = await addressesApi.getById("addr-123");

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        "/addresses/addr-123",
        expect.anything(), // schema
      );
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

      mockApiPostValidated.mockResolvedValue(mockAddress);

      const result = await addressesApi.create(createData);

      expect(mockApiPostValidated).toHaveBeenCalledWith(
        "/addresses",
        expect.anything(), // schema
        createData,
      );
      expect(result).toEqual(mockAddress);
    });
  });

  describe("update", () => {
    it("updates address", async () => {
      const updateData = { isDefault: false };
      const updatedAddress = { ...mockAddress, isDefault: false };

      mockApiPutValidated.mockResolvedValue(updatedAddress);

      const result = await addressesApi.update("addr-123", updateData);

      expect(mockApiPutValidated).toHaveBeenCalledWith(
        "/addresses/addr-123",
        expect.anything(), // schema
        updateData,
      );
      expect(result).toEqual(updatedAddress);
    });
  });

  describe("delete", () => {
    it("deletes address", async () => {
      mockApiDelete.mockResolvedValue(undefined);

      const result = await addressesApi.delete("addr-123");

      expect(mockApiDelete).toHaveBeenCalledWith("/addresses/addr-123");
      expect(result).toBeUndefined();
    });
  });

  describe("setDefault", () => {
    it("sets address as default", async () => {
      mockApiPatchValidated.mockResolvedValue(mockAddress);

      const result = await addressesApi.setDefault("addr-123");

      expect(mockApiPatchValidated).toHaveBeenCalledWith(
        "/addresses/addr-123/default",
        expect.anything(), // schema
        {},
      );
      expect(result).toEqual(mockAddress);
    });
  });
});
