// Global type definitions for the eyewear store

import type { ProductId, UserId, OrderId, AddressId } from "./utils";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  brand: string;
  frameType: FrameType;
  material: string;
  color: string;
  lensType?: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  features: string[];
}

export type ProductCategory = "sunglasses" | "eyeglasses" | "sports" | "kids";
export type FrameType =
  | "full-rim"
  | "semi-rimless"
  | "rimless"
  | "aviator"
  | "wayfarer"
  | "round"
  | "cat-eye";

export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  priceRange?: [number, number];
  frameType?: FrameType;
  color?: string;
  inStock?: boolean;
}

export interface CartItem {
  productId: ProductId;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Address {
  id: AddressId;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface User {
  id: UserId;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
