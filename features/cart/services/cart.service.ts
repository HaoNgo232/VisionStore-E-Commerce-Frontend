/**
 * Cart Service
 * API integration for shopping cart management
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "@/types";

export const cartApi = {
  async getCart(): Promise<Cart> {
    return apiGet<Cart>("/cart");
  },

  async addItem(data: AddToCartRequest): Promise<Cart> {
    return apiPost<Cart>("/cart/items", data);
  },

  async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    return apiPatch<Cart>(`/cart/items/${itemId}`, data);
  },

  async removeItem(itemId: string): Promise<Cart> {
    return apiDelete<Cart>(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    return apiDelete("/cart");
  },
};
