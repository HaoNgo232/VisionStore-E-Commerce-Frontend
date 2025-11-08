/**
 * Cart Types
 * Shopping cart, items, and checkout related types
 * Note: Cart and CartItem types match backend @shared/types/cart.types.ts
 */

import { z } from "zod";
import { cuidSchema } from "./common.types";

/**
 * Zod schema for CartItem product snapshot
 */
const CartItemProductSchema = z
  .object({
    id: cuidSchema(), // Backend uses CUID, not UUID
    name: z.string(),
    priceInt: z.number().int().nonnegative(),
    imageUrls: z.preprocess(
      (val) => {
        // Handle null, undefined, or empty values
        if (val === null || val === undefined) return [];
        if (Array.isArray(val)) return val;
        return [];
      },
      z.array(z.string()).default([]), // Accept any string array, not strict URL validation
    ),
    slug: z.string().optional(),
  })
  .passthrough(); // Allow additional fields from backend

/**
 * Zod schema for CartItemResponse (basic cart item without product)
 * Used in CartResponse.items
 */
const CartItemResponseSchema = z
  .object({
    id: cuidSchema(), // Backend uses CUID, not UUID
    cartId: cuidSchema(), // Backend uses CUID, not UUID
    productId: cuidSchema(), // Backend uses CUID, not UUID
    quantity: z.preprocess((val) => {
      // Handle edge cases - ensure positive integer
      if (typeof val === "number") return Math.max(1, Math.floor(val));
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? 1 : Math.max(1, num);
      }
      return 1;
    }, z.number().int().positive()),
    createdAt: z.preprocess((val) => {
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
    updatedAt: z.preprocess((val) => {
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
  })
  .passthrough(); // Allow additional fields from backend

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
    slug?: string | undefined;
  } | null; // Product can be null in CartItemWithProduct from backend
}

/**
 * Zod schema for CartItem (with product)
 * Note: product can be null in CartItemWithProduct from backend
 */
export const CartItemSchema = z
  .object({
    id: cuidSchema(), // Backend uses CUID, not UUID
    cartId: cuidSchema(), // Backend uses CUID, not UUID
    productId: cuidSchema(), // Backend uses CUID, not UUID
    quantity: z.preprocess((val) => {
      // Handle edge cases - ensure positive integer
      if (typeof val === "number") return Math.max(1, Math.floor(val));
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? 1 : Math.max(1, num);
      }
      return 1;
    }, z.number().int().positive()),
    createdAt: z.preprocess((val) => {
      // Convert Date to ISO string if needed
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
    updatedAt: z.preprocess((val) => {
      // Convert Date to ISO string if needed
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
    product: z.preprocess((val) => {
      // Handle null, undefined, or empty object
      if (val === null || val === undefined) return null;
      if (typeof val === "object" && val !== null) return val;
      return null;
    }, CartItemProductSchema.nullable()), // Product can be null in backend response
  })
  .passthrough(); // Allow additional fields from backend

/**
 * CartResponse interface (cart from backend without product in items)
 * Used in CartWithProductsResponse
 */
export interface CartResponse {
  id: string;
  sessionId: string;
  userId: string | null;
  items: Omit<CartItem, "product">[]; // Items without product field
  totalInt: number; // VND
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

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
 * Zod schema for CartResponse (basic cart from backend)
 * Note: items in CartResponse don't have product field
 */
const CartResponseSchema = z
  .object({
    id: cuidSchema(), // Backend uses CUID, not UUID
    sessionId: z.string().min(1),
    userId: z.preprocess((val) => {
      // Handle null, undefined, or empty string
      if (val === null || val === undefined || val === "") return null;
      return String(val);
    }, cuidSchema().nullable()), // Backend uses CUID, not UUID
    items: z.preprocess((val) => {
      // Handle null, undefined, or ensure array
      if (val === null || val === undefined) return [];
      if (Array.isArray(val)) return val;
      return [];
    }, z.array(CartItemResponseSchema).default([])), // Basic items without product
    totalInt: z.preprocess((val) => {
      // Handle null, undefined, or ensure number
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    }, z.number().int().nonnegative()), // Total amount in VND
    createdAt: z.preprocess((val) => {
      // Convert Date to ISO string if needed
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
    updatedAt: z.preprocess((val) => {
      // Convert Date to ISO string if needed
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      return String(val);
    }, z.string()),
  })
  .passthrough(); // Allow additional fields from backend

/**
 * Zod schema for Cart (with items that have product)
 * Used for frontend Cart type
 */
export const CartSchema = z.object({
  id: cuidSchema(), // Backend uses CUID, not UUID
  sessionId: z.string().min(1),
  userId: z.preprocess((val) => {
    // Handle null, undefined, or empty string
    if (val === null || val === undefined || val === "") return null;
    return String(val);
  }, cuidSchema().nullable()), // Backend uses CUID, not UUID
  items: z.array(CartItemSchema), // Items with product field
  totalInt: z.number().int().nonnegative(),
  createdAt: z.preprocess((val) => {
    // Convert Date to ISO string if needed
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    return String(val);
  }, z.string()),
  updatedAt: z.preprocess((val) => {
    // Convert Date to ISO string if needed
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    return String(val);
  }, z.string()),
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

/**
 * Cart with products response (from POST /cart/items)
 * Backend returns wrapped structure with cart, items, and totalInt
 */
export interface CartWithProductsResponse {
  cart: CartResponse; // Cart from backend (items don't have product)
  items: CartItem[]; // Items with product field
  totalInt: number;
}

/**
 * Zod schema for CartWithProductsResponse
 * Backend returns: { cart: CartResponse (without product in items), items: CartItemWithProduct[], totalInt }
 */
export const CartWithProductsResponseSchema = z
  .object({
    cart: CartResponseSchema, // CartResponse has basic items without product
    items: z.preprocess((val) => {
      // Handle null, undefined, or ensure array
      if (val === null || val === undefined) return [];
      if (Array.isArray(val)) return val;
      return [];
    }, z.array(CartItemSchema).default([])), // Items with product field
    totalInt: z.number().int().nonnegative(),
  })
  .passthrough(); // Allow additional fields from backend
