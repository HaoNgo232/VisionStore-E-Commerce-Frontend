import { ordersApi } from "./orders.service";
import { useAuthStore } from "@/stores/auth.store";
import * as apiClient from "@/lib/api-client";
import { OrderStatus, PaymentStatus } from "@/types";

// Mock dependencies
jest.mock("@/stores/auth.store");
jest.mock("@/lib/api-client");

describe("ordersApi", () => {
  const mockUserId = "user-123";
  const mockOrder = {
    id: "order-123",
    userId: mockUserId,
    addressId: "addr-123",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    totalInt: 199900,
    items: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth store
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      getUserId: jest.fn().mockReturnValue(mockUserId),
    });
  });

  describe("getAll", () => {
    it("fetches orders with userId param", async () => {
      const mockResponse = {
        items: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (apiClient.apiGet as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ordersApi.getAll();

      expect(apiClient.apiGet).toHaveBeenCalledWith("/orders", {
        params: { userId: mockUserId },
      });
      expect(result).toEqual(mockResponse);
    });

    it("throws error when userId is missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      await expect(ordersApi.getAll()).rejects.toThrow(
        "User not authenticated - userId is missing",
      );
    });
  });

  describe("getById", () => {
    it("fetches order by id", async () => {
      (apiClient.apiGet as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersApi.getById("order-123");

      expect(apiClient.apiGet).toHaveBeenCalledWith("/orders/order-123");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("create", () => {
    it("creates order with userId", async () => {
      const createData = {
        addressId: "addr-123",
        items: [
          {
            productId: "prod-123",
            quantity: 1,
            priceInt: 199900,
          },
        ],
      };

      (apiClient.apiPost as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersApi.create(createData);

      expect(apiClient.apiPost).toHaveBeenCalledWith("/orders", {
        ...createData,
        userId: mockUserId,
      });
      expect(result).toEqual(mockOrder);
    });

    it("throws error when userId is missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      const createData = {
        items: [
          {
            productId: "prod-123",
            quantity: 1,
            priceInt: 199900,
          },
        ],
      };

      await expect(ordersApi.create(createData)).rejects.toThrow(
        "User not authenticated - userId is missing",
      );
    });
  });

  describe("updateStatus", () => {
    it("updates order status", async () => {
      const updateData = { status: OrderStatus.PROCESSING };
      const updatedOrder = { ...mockOrder, status: OrderStatus.PROCESSING };

      (apiClient.apiPatch as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await ordersApi.updateStatus("order-123", updateData);

      expect(apiClient.apiPatch).toHaveBeenCalledWith(
        "/orders/order-123/status",
        updateData,
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("cancel", () => {
    it("cancels order", async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      (apiClient.apiPatch as jest.Mock).mockResolvedValue(cancelledOrder);

      const result = await ordersApi.cancel("order-123");

      expect(apiClient.apiPatch).toHaveBeenCalledWith(
        "/orders/order-123/cancel",
        {},
      );
      expect(result).toEqual(cancelledOrder);
    });
  });

  describe("delete", () => {
    it("deletes order", async () => {
      (apiClient.apiDelete as jest.Mock).mockResolvedValue(undefined);

      const result = await ordersApi.delete("order-123");

      expect(apiClient.apiDelete).toHaveBeenCalledWith("/orders/order-123");
      expect(result).toBeUndefined();
    });
  });
});
