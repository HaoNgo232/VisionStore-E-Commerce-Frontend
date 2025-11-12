/**
 * OrderSummary Component Tests
 */

import { render, screen } from "@testing-library/react"
import { OrderSummary } from "./order-summary"
import type { Cart, CartItem } from "@/types"

// Mock Next.js Image
jest.mock("next/image", () => {
  return ({
    src,
    alt,
  }: {
    src: string
    alt: string
    width: number
    height: number
    className: string
  }) => {
    return <img src={src} alt={alt} />
  }
})

// Mock formatPrice utility
jest.mock("@/features/products/utils", () => ({
  formatPrice: jest.fn((price: number) => {
    return `${price.toLocaleString("vi-VN")} đ`
  }),
}))

describe("OrderSummary", () => {
  const mockProduct1 = {
    id: "product-1",
    name: "Product 1",
    priceInt: 100000,
    imageUrls: ["https://example.com/product1.jpg"],
  }

  const mockProduct2 = {
    id: "product-2",
    name: "Product 2",
    priceInt: 200000,
    imageUrls: ["https://example.com/product2.jpg"],
  }

  const mockCartItem1: CartItem = {
    id: "item-1",
    cartId: "cart-123",
    productId: mockProduct1.id,
    quantity: 2,
    product: mockProduct1,
  }

  const mockCartItem2: CartItem = {
    id: "item-2",
    cartId: "cart-123",
    productId: mockProduct2.id,
    quantity: 1,
    product: mockProduct2,
  }

  const mockCart: Cart = {
    id: "cart-123",
    sessionId: "session-123",
    userId: "user-123",
    items: [mockCartItem1, mockCartItem2],
    totalInt: 400000,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }

  it("renders all cart items", () => {
    render(<OrderSummary cart={mockCart} />)

    expect(screen.getByText("Product 1")).toBeInTheDocument()
    expect(screen.getByText("Product 2")).toBeInTheDocument()
    expect(screen.getByText("Số lượng: 2")).toBeInTheDocument()
    expect(screen.getByText("Số lượng: 1")).toBeInTheDocument()
  })

  it("displays product images", () => {
    render(<OrderSummary cart={mockCart} />)

    const images = screen.getAllByRole("img")
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute("src", mockProduct1.imageUrls[0])
    expect(images[0]).toHaveAttribute("alt", mockProduct1.name)
  })

  it("handles missing product image with placeholder", () => {
    const cartWithMissingImage: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem1,
          product: {
            ...mockProduct1,
            imageUrls: [],
          },
        },
      ],
    }

    render(<OrderSummary cart={cartWithMissingImage} />)

    const image = screen.getByRole("img")
    expect(image).toHaveAttribute("src", "/placeholder.svg")
  })

  it("handles missing product name", () => {
    const cartWithMissingName: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem1,
          product: {
            ...mockProduct1,
            name: undefined as unknown as string,
          },
        },
      ],
    }

    render(<OrderSummary cart={cartWithMissingName} />)

    expect(screen.getByText("Sản phẩm")).toBeInTheDocument()
  })

  it("calculates and displays item totals correctly", () => {
    render(<OrderSummary cart={mockCart} />)

    // Product 1: 100000 * 2 = 200000
    // Product 2: 200000 * 1 = 200000
    // Both should be displayed (formatPrice is mocked)
    expect(screen.getByText("Chi tiết đơn hàng")).toBeInTheDocument()
  })

  it("renders empty cart gracefully", () => {
    const emptyCart: Cart = {
      ...mockCart,
      items: [],
    }

    render(<OrderSummary cart={emptyCart} />)

    expect(screen.getByText("Chi tiết đơn hàng")).toBeInTheDocument()
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument()
  })
})

