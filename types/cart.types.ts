/**
 * Cart Types
 * Shopping cart, items, and checkout related types
 */

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
