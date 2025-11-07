/**
 * Cart Service
 * API integration for shopping cart management
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "@/types";

export const cartApi = {
  async getCart(): Promise<Cart> {
    return apiGet<Cart>("/cart");
  },

  async addItem(data: AddToCartRequest & { priceInt: number }): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return apiPost<Cart>("/cart/items", {
      userId,
      ...data,
    });
  },

  async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return apiPatch<Cart>("/cart/items", {
      userId,
      ...data,
    });
  },

  async removeItem(itemId: string, productId: string): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return apiDelete<Cart>("/cart/items", {
      data: { userId, productId },
    });
  },

  async clearCart(): Promise<void> {
    return apiDelete("/cart");
  },
};
