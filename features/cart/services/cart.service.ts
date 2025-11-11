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
import { CartWithProductsResponseSchema } from "@/types";
import type { z } from "zod";

/**
 * Interface for Cart Service
 * Defines contract for shopping cart management operations
 */
export interface ICartService {
  /**
   * Get current user's cart
   */
  getCart(): Promise<Cart>;

  /**
   * Add item to cart
   */
  addItem(data: AddToCartRequest): Promise<Cart>;

  /**
   * Update cart item quantity
   */
  updateItem(data: UpdateCartItemRequest): Promise<Cart>;

  /**
   * Remove item from cart
   */
  removeItem(productId: string): Promise<Cart>;

  /**
   * Clear entire cart
   */
  clearCart(): Promise<void>;
}

/**
 * Cart Service Implementation
 * Handles shopping cart management with runtime validation
 */
export class CartService implements ICartService {
  /**
   * Helper method to unwrap CartWithProductsResponse into Cart
   * Backend returns { cart, items, totalInt } but we need to merge items into cart
   */
  private unwrapCartResponse(response: CartWithProductsResponse): Cart {
    return {
      ...response.cart,
      items: response.items,
      totalInt: response.totalInt,
    };
  }

  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiGetValidated<CartWithProductsResponse>(
      "/cart",
      CartWithProductsResponseSchema as z.ZodType<CartWithProductsResponse>,
    );
    return this.unwrapCartResponse(response);
  }

  /**
   * Add item to cart
   */
  async addItem(data: AddToCartRequest): Promise<Cart> {
    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      throw new Error("Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng");
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
    return this.unwrapCartResponse(response);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(data: UpdateCartItemRequest): Promise<Cart> {
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
    return this.unwrapCartResponse(response);
  }

  /**
   * Remove item from cart
   */
  async removeItem(productId: string): Promise<Cart> {
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
    return this.unwrapCartResponse(response);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    return apiDelete<void>("/cart");
  }
}

/**
 * Default instance of CartService
 * Export singleton instance for backward compatibility
 */
export const cartApi = new CartService();
