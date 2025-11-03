import { renderHook, waitFor, act } from "@testing-library/react";
import { useAddresses } from "./use-addresses";
import { addressesApi } from "@/features/addresses/services/addresses.service";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

jest.mock("@/features/addresses/services/addresses.service");
jest.mock("@/lib/api-client");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useAddresses", () => {
  const mockAddress = {
    id: "addr-123",
    userId: "user-123",
    fullName: "John Doe",
    phone: "0123456789",
    street: "123 Main St",
    ward: "Ward 1",
    district: "District 1",
    city: "Ho Chi Minh City",
    isDefault: true,
    createdAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches addresses on mount", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useAddresses());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.addresses).toEqual([mockAddress]);
    expect(addressesApi.getAll).toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    const errorMessage = "Failed to fetch addresses";
    (addressesApi.getAll as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );
    (getErrorMessage as jest.Mock).mockReturnValue(errorMessage);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it("creates new address", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createData = {
      fullName: "Jane Doe",
      phone: "0987654321",
      street: "456 Oak St",
      ward: "Ward 2",
      district: "District 2",
      city: "Hanoi",
      isDefault: false,
    };

    const newAddress = { ...mockAddress, ...createData, id: "addr-456" };
    (addressesApi.create as jest.Mock).mockResolvedValue(newAddress);

    let createdAddress;
    await act(async () => {
      createdAddress = await result.current.create(createData);
    });

    expect(createdAddress).toEqual(newAddress);
    expect(result.current.addresses).toContain(newAddress);
    expect(toast.success).toHaveBeenCalledWith("Đã thêm địa chỉ mới");
  });

  it("handles create error", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const errorMessage = "Failed to create address";
    (addressesApi.create as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );
    (getErrorMessage as jest.Mock).mockReturnValue(errorMessage);

    const createData = {
      fullName: "Jane Doe",
      phone: "0987654321",
      street: "456 Oak St",
      ward: "Ward 2",
      district: "District 2",
      city: "Hanoi",
    };

    await expect(
      act(async () => {
        await result.current.create(createData);
      }),
    ).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it("updates address", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData = { ...mockAddress, fullName: "Jane Doe" };
    (addressesApi.update as jest.Mock).mockResolvedValue(updateData);

    let updated;
    await act(async () => {
      updated = await result.current.update("addr-123", updateData);
    });

    expect(updated).toEqual(updateData);
    expect(result.current.addresses[0]).toEqual(updateData);
    expect(toast.success).toHaveBeenCalledWith("Đã cập nhật địa chỉ");
  });

  it("removes address", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (addressesApi.delete as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.remove("addr-123");
    });

    expect(result.current.addresses).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith("Đã xoá địa chỉ");
  });

  it("handles remove error", async () => {
    (addressesApi.getAll as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const errorMessage = "Failed to remove address";
    (addressesApi.delete as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );
    (getErrorMessage as jest.Mock).mockReturnValue(errorMessage);

    await expect(
      act(async () => {
        await result.current.remove("addr-123");
      }),
    ).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
});
