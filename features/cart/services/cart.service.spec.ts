import { cartApi } from "./cart.service";
import { useAuthStore } from "@/stores/auth.store";
import * as apiClient from "@/lib/api-client";
import type { Cart, CartWithProductsResponse } from "@/types";

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

  const createMockResponse = (cart: Cart): CartWithProductsResponse => ({
    cart: {
      id: cart.id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      items: cart.items.map(({ product, ...item }) => item), // Remove product field for CartResponse
      totalInt: cart.totalInt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    },
    items: cart.items,
    totalInt: cart.totalInt,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      getUserId: jest.fn().mockReturnValue(mockUserId),
    });
  });

  describe("getCart", () => {
    it("fetches user cart", async () => {
      const mockResponse = createMockResponse(mockCart);
      (apiClient.apiGetValidated as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartApi.getCart();

      expect(apiClient.apiGetValidated).toHaveBeenCalledWith(
        "/cart",
        expect.anything(),
      );
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

      const newItem = {
        id: "item-456",
        cartId: "cart-123",
        productId: "prod-456",
        quantity: 1,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        product: {
          id: "prod-456",
          name: "Product 2",
          priceInt: 299900,
          imageUrls: ["https://example.com/image2.jpg"],
        },
      };

      const updatedCart: Cart = {
        ...mockCart,
        items: [...mockCart.items, newItem],
        totalInt: mockCart.totalInt + addRequest.priceInt,
      };

      const mockResponse = createMockResponse(updatedCart);
      (apiClient.apiPostValidated as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartApi.addItem(addRequest);

      expect(apiClient.apiPostValidated).toHaveBeenCalledWith(
        "/cart/items",
        expect.anything(),
        {
          userId: mockUserId,
          ...addRequest,
        },
      );
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
        "Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng",
      );
    });
  });

  describe("updateItem", () => {
    it("updates cart item with userId", async () => {
      const updateRequest = { productId: "prod-123", quantity: 3 };

      const originalItem = mockCart.items[0];
      if (!originalItem) {
        throw new Error("mockCart.items[0] is required for test");
      }

      const updatedCart: Cart = {
        ...mockCart,
        items: [
          {
            ...originalItem,
            quantity: 3,
          },
        ],
        totalInt: 99950 * 3,
      };

      const mockResponse = createMockResponse(updatedCart);
      (apiClient.apiPatchValidated as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await cartApi.updateItem(updateRequest);

      expect(apiClient.apiPatchValidated).toHaveBeenCalledWith(
        "/cart/items",
        expect.anything(),
        {
          userId: mockUserId,
          ...updateRequest,
        },
      );
      expect(result).toEqual(updatedCart);
    });

    it("throws error when userId missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      await expect(
        cartApi.updateItem({ productId: "prod-123", quantity: 3 }),
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

      const mockResponse = createMockResponse(emptyCart);
      (apiClient.apiDeleteValidated as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await cartApi.removeItem("prod-123");

      expect(apiClient.apiDeleteValidated).toHaveBeenCalledWith(
        "/cart/items",
        expect.anything(),
        {
          data: { userId: mockUserId, productId: "prod-123" },
        },
      );
      expect(result).toEqual(emptyCart);
    });

    it("throws error when userId missing", async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        getUserId: jest.fn().mockReturnValue(null),
      });

      await expect(cartApi.removeItem("prod-123")).rejects.toThrow(
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
