"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Cart, CartItem } from "@/types";
import { productsApi } from "@/features/products/services/products.service";

interface CartStore extends Cart {
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  updateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get: any) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      addItem: async (productId: string, quantity = 1) => {
        set({ isLoading: true });
        try {
          const product = await productsApi.getById(productId);
          if (!product) throw new Error("Product not found");

          set((state: CartStore) => {
            const existingItem = state.items.find(
              (item: CartItem) => item.productId === productId,
            );

            if (existingItem) {
              toast.success("Đã cập nhật số lượng trong giỏ hàng", {
                description: `${product.name} - Số lượng: ${
                  existingItem.quantity + quantity
                }`,
              });
              return {
                items: state.items.map((item: CartItem) =>
                  item.productId === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item,
                ),
              };
            }

            toast.success("Đã thêm vào giỏ hàng", {
              description: `${product.name} - Số lượng: ${quantity}`,
            });
            return {
              items: [
                ...state.items,
                { productId, product, quantity } as CartItem,
              ],
            };
          });

          // Recalculate totals
          get().updateTotals();
        } catch (error) {
          console.error("[v0] Failed to add item to cart:", error);
          toast.error("Không thể thêm vào giỏ hàng", {
            description: "Vui lòng thử lại sau.",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: (productId: string) => {
        set((state: CartStore) => {
          const item = state.items.find(
            (item: CartItem) => item.productId === productId,
          );
          if (item) {
            toast.info("Đã xóa khỏi giỏ hàng", {
              description: item.product.name,
            });
          }

          return {
            items: state.items.filter(
              (item: CartItem) => item.productId !== productId,
            ),
          };
        });

        get().updateTotals();
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state: CartStore) => ({
          items: state.items.map((item: CartItem) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));

        get().updateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      updateTotals: () => {
        set((state: CartStore) => {
          const total = state.items.reduce(
            (sum: number, item: CartItem) =>
              sum + item.product.price * item.quantity,
            0,
          );
          const itemCount = state.items.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0,
          );
          return { total, itemCount };
        });
      },
    }),
    {
      name: "cart-store",
    },
  ),
);
