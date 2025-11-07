/**
 * Cart Service
 * API integration for shopping cart management with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDelete,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "@/types";
import { CartSchema } from "@/types";

export const cartApi = {
  async getCart(): Promise<Cart> {
    return apiGetValidated<Cart>("/cart", CartSchema);
  },

  async addItem(data: AddToCartRequest): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return apiPostValidated<Cart, AddToCartRequest & { userId: string }>(
      "/cart/items",
      CartSchema,
      {
        userId,
        ...data,
      },
    );
  },

  async updateItem(
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return apiPatchValidated<Cart, UpdateCartItemRequest & { userId: string }>(
      "/cart/items",
      CartSchema,
      {
        userId,
        ...data,
      },
    );
  },

  async removeItem(itemId: string, productId: string): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Note: DELETE with body might need special handling
    // Using POST to /cart/items/remove or similar endpoint might be better
    // For now, using DELETE with data in config
    return apiDelete<Cart>("/cart/items", {
      data: { userId, productId },
    });
  },

  async clearCart(): Promise<void> {
    return apiDelete<void>("/cart");
  },
};
