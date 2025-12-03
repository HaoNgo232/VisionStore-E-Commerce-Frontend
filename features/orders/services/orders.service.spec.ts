import { ordersApi } from "./orders.service";
import { useAuthStore } from "@/stores/auth.store";
import { OrderStatus, PaymentStatus } from "@/types";

// Mock dependencies
jest.mock("@/stores/auth.store");

const mockApiGetValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiPostValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiPatchValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiDelete = jest.fn<Promise<unknown>, unknown[]>();

jest.mock("@/lib/api-client", () => ({
  apiGetValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiGetValidated(...args),
  apiPostValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPostValidated(...args),
  apiPatchValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPatchValidated(...args),
  apiDelete: (...args: unknown[]): Promise<unknown> => mockApiDelete(...args),
}));

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

      mockApiGetValidated.mockResolvedValue(mockResponse);

      const result = await ordersApi.getAll();

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        "/orders",
        expect.anything(), // schema
        {
          params: { userId: mockUserId },
        },
      );
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
      mockApiGetValidated.mockResolvedValue(mockOrder);

      const result = await ordersApi.getById("order-123");

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        "/orders/order-123",
        expect.anything(), // schema
      );
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

      mockApiPostValidated.mockResolvedValue(mockOrder);

      const result = await ordersApi.create(createData);

      expect(mockApiPostValidated).toHaveBeenCalledWith(
        "/orders",
        expect.anything(), // schema
        {
          ...createData,
          userId: mockUserId,
        },
      );
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

      mockApiPatchValidated.mockResolvedValue(updatedOrder);

      const result = await ordersApi.updateStatus("order-123", updateData);

      expect(mockApiPatchValidated).toHaveBeenCalledWith(
        "/orders/order-123/status",
        expect.anything(), // schema
        updateData,
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("cancel", () => {
    it("cancels order", async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      mockApiPatchValidated.mockResolvedValue(cancelledOrder);

      const result = await ordersApi.cancel("order-123");

      expect(mockApiPatchValidated).toHaveBeenCalledWith(
        "/orders/order-123/cancel",
        expect.anything(), // schema
        {},
      );
      expect(result).toEqual(cancelledOrder);
    });
  });

  describe("delete", () => {
    it("deletes order", async () => {
      mockApiDelete.mockResolvedValue(undefined);

      const result = await ordersApi.delete("order-123");

      expect(mockApiDelete).toHaveBeenCalledWith("/orders/order-123");
      expect(result).toBeUndefined();
    });
  });
});
