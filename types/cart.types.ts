/**
 * Cart Types
 * Shopping cart, items, and checkout related types
 * Note: Cart and CartItem types match backend @shared/types/cart.types.ts
 */

import { z } from "zod";

/**
 * Zod schema for CartItem product snapshot
 */
const CartItemProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceInt: z.number().int().nonnegative(),
  imageUrls: z.array(z.string().url()),
  slug: z.string().optional(),
});

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
  product: {
    id: string;
    name: string;
    priceInt: number;
    imageUrls: string[];
    slug?: string;
  };
}

/**
 * Zod schema for CartItem
 */
export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  product: CartItemProductSchema,
});

export interface Cart {
  id: string;
  sessionId: string;
  userId: string | null;
  items: CartItem[];
  totalInt: number; // VND
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

/**
 * Zod schema for Cart
 */
export const CartSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().min(1),
  userId: z.string().uuid().nullable(),
  items: z.array(CartItemSchema),
  totalInt: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Sync cart request (after login)
 */
export interface SyncCartRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

/**
 * Update cart item quantity request
 */
export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}
