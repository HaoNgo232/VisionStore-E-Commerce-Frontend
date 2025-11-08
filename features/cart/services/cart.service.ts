/**
 * Cart Service
 * API integration for shopping cart management with runtime validation
 */

import {
  apiGetValidated,
  apiPostValidated,
  apiPatchValidated,
  apiDeleteValidated,
  apiDelete,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartWithProductsResponse,
} from "@/types";
import { CartSchema, CartWithProductsResponseSchema } from "@/types";
import type { z } from "zod";

export const cartApi = {
  async getCart(): Promise<Cart> {
    const response = await apiGetValidated<CartWithProductsResponse>(
      "/cart",
      CartWithProductsResponseSchema as z.ZodType<CartWithProductsResponse>,
    );
    // Unwrap response - backend returns { cart, items, totalInt }
    // but we need to merge items into cart for consistency
    return {
      ...response.cart,
      items: response.items,
      totalInt: response.totalInt,
    };
  },

  async addItem(data: AddToCartRequest): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const response = await apiPostValidated<
      CartWithProductsResponse,
      AddToCartRequest & { userId: string }
    >(
      "/cart/items",
      CartWithProductsResponseSchema as z.ZodType<CartWithProductsResponse>,
      {
        userId,
        ...data,
      },
    );
    // Unwrap response - backend returns { cart, items, totalInt }
    // but we need to merge items into cart for consistency
    return {
      ...response.cart,
      items: response.items,
      totalInt: response.totalInt,
    };
  },

  async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const response = await apiPatchValidated<
      CartWithProductsResponse,
      UpdateCartItemRequest & { userId: string }
    >(
      "/cart/items",
      CartWithProductsResponseSchema as z.ZodType<CartWithProductsResponse>,
      {
        userId,
        ...data,
      },
    );
    // Unwrap response - backend returns { cart, items, totalInt }
    // but we need to merge items into cart for consistency
    return {
      ...response.cart,
      items: response.items,
      totalInt: response.totalInt,
    };
  },

  async removeItem(itemId: string, productId: string): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const response = await apiDeleteValidated<CartWithProductsResponse>(
      "/cart/items",
      CartWithProductsResponseSchema as z.ZodType<CartWithProductsResponse>,
      {
        data: { userId, productId },
      },
    );
    // Unwrap response - backend returns { cart, items, totalInt }
    // but we need to merge items into cart for consistency
    return {
      ...response.cart,
      items: response.items,
      totalInt: response.totalInt,
    };
  },

  async clearCart(): Promise<void> {
    return apiDelete<void>("/cart");
  },
};
