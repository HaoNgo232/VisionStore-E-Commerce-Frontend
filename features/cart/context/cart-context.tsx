"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import type { Cart } from "@/types"
import { productsApi } from "@/lib/api-client"

interface CartContextType {
  cart: Cart
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Calculate totals whenever items change
  useEffect(() => {
    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    setCart((prev) => ({
      ...prev,
      total,
      itemCount,
    }))
  }, [cart.items])

  const addItem = async (productId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call when backend is ready
      // await cartApi.addItem('user-id', productId, quantity);

      const product = await productsApi.getById(productId)
      if (!product) throw new Error("Product not found")

      setCart((prev) => {
        const existingItem = prev.items.find((item) => item.productId === productId)

        if (existingItem) {
          toast.success("Đã cập nhật số lượng trong giỏ hàng", {
            description: `${product.name} - Số lượng: ${existingItem.quantity + quantity}`,
          })
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
            ),
          }
        }

        toast.success("Đã thêm vào giỏ hàng", {
          description: `${product.name} - Số lượng: ${quantity}`,
        })
        return {
          ...prev,
          items: [...prev.items, { productId, product, quantity }],
        }
      })
    } catch (error) {
      console.error("[v0] Failed to add item to cart:", error)
      toast.error("Không thể thêm vào giỏ hàng", {
        description: "Vui lòng thử lại sau.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (productId: string) => {
    // TODO: Replace with actual API call when backend is ready
    // await cartApi.removeItem('user-id', productId);

    const item = cart.items.find((item) => item.productId === productId)
    if (item) {
      toast.info("Đã xóa khỏi giỏ hàng", {
        description: item.product.name,
      })
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    // TODO: Replace with actual API call when backend is ready
    // await cartApi.updateItem('user-id', productId, quantity);

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    }))
  }

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
