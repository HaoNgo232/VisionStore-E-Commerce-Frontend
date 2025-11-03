import { cartApi } from "./cart.service";
import { useAuthStore } from "@/stores/auth.store";
import * as apiClient from "@/lib/api-client";
import type { Cart } from "@/types";

jest.mock("@/stores/auth.store");
jest.mock("@/lib/api-client");

describe("cartApi", () => {
  const mockUserId = "user-123";
  const mockCart: Cart = {
    id: "cart-123",
    sessionId: "session-123",
    userId: mockUserId,
    items: [
      {
        id: "item-123",
        cartId: "cart-123",
        productId: "prod-123",
        quantity: 2,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        product: {
          id: "prod-123",
          name: "Product 1",
          priceInt: 99950,
          imageUrls: ["https://example.com/image.jpg"],
        },
      },
    ],
    totalInt: 199900,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      getUserId: jest.fn().mockReturnValue(mockUserId),
    });
  });

  describe("getCart", () => {
    it("fetches user cart", async () => {
      (apiClient.apiGet as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartApi.getCart();

      expect(apiClient.apiGet).toHaveBeenCalledWith("/cart");
      expect(result).toEqual(mockCart);
    });
  });

  describe("addItem", () => {
    it("adds item to cart with userId", async () => {
      const addRequest = {
        productId: "prod-456",
        quantity: 1,
        priceInt: 299900,
      };

      const updatedCart = {
        ...mockCart,
        items: [...mockCart.items, addRequest],
      };

      (apiClient.apiPost as jest.Mock).mockResolvedValue(updatedCart);

      const result = await cartApi.addItem(addRequest);

      expect(apiClient.apiPost).toHaveBeenCalledWith("/cart/items", {
        userId: mockUserId,
        ...addRequest,
      });
      expect(result).toEqual(updatedCart);
    });

    it("throws error when userId missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      const addRequest = {
        productId: "prod-456",
        quantity: 1,
        priceInt: 299900,
      };

      await expect(cartApi.addItem(addRequest)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  describe("updateItem", () => {
    it("updates cart item with userId", async () => {
      const updateRequest = { productId: "prod-123", quantity: 3 };

      const updatedCart = {
        ...mockCart,
        items: [{ ...mockCart.items[0], quantity: 3 }],
      };

      (apiClient.apiPatch as jest.Mock).mockResolvedValue(updatedCart);

      const result = await cartApi.updateItem("item-123", updateRequest);

      expect(apiClient.apiPatch).toHaveBeenCalledWith("/cart/items", {
        userId: mockUserId,
        ...updateRequest,
      });
      expect(result).toEqual(updatedCart);
    });

    it("throws error when userId missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      await expect(
        cartApi.updateItem("item-123", { productId: "prod-123", quantity: 3 }),
      ).rejects.toThrow("User not authenticated");
    });
  });

  describe("removeItem", () => {
    it("removes item from cart with userId", async () => {
      const emptyCart: Cart = {
        ...mockCart,
        items: [],
        totalInt: 0,
      };

      (apiClient.apiDelete as jest.Mock).mockResolvedValue(emptyCart);

      const result = await cartApi.removeItem("item-123", "prod-123");

      expect(apiClient.apiDelete).toHaveBeenCalledWith("/cart/items", {
        data: { userId: mockUserId, productId: "prod-123" },
      });
      expect(result).toEqual(emptyCart);
    });

    it("throws error when userId missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      await expect(cartApi.removeItem("item-123", "prod-123")).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  describe("clearCart", () => {
    it("clears entire cart", async () => {
      (apiClient.apiDelete as jest.Mock).mockResolvedValue(undefined);

      const result = await cartApi.clearCart();

      expect(apiClient.apiDelete).toHaveBeenCalledWith("/cart");
      expect(result).toBeUndefined();
    });
  });
});
