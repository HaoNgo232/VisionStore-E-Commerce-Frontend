/**
 * Cart Types
 * Shopping cart, items, and checkout related types
 * Note: Cart and CartItem types match backend @shared/types/cart.types.ts
 */

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
  } | null;
}

export interface Cart {
  id: string;
  sessionId: string;
  userId: string | null;
  items: CartItem[];
  totalInt: number; // cents
  createdAt: string; // Date serialized from API
  updatedAt: string; // Date serialized from API
}

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
