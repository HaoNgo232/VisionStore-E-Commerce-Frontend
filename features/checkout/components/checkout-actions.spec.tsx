/**
 * CheckoutActions Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { CheckoutActions } from "./checkout-actions"

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock formatPrice utility
jest.mock("@/features/products/utils", () => ({
  formatPrice: jest.fn((price: number) => {
    return `${price.toLocaleString("vi-VN")} đ`
  }),
}))

describe("CheckoutActions", () => {
  const mockOnCheckout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders order summary with total", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={false}
        onCheckout={mockOnCheckout}
      />
    )

    expect(screen.getByText("Tóm tắt")).toBeInTheDocument()
    expect(screen.getByText("Tạm tính")).toBeInTheDocument()
    expect(screen.getByText("Vận chuyển")).toBeInTheDocument()
    expect(screen.getByText("Miễn phí")).toBeInTheDocument()
    expect(screen.getByText("Tổng cộng")).toBeInTheDocument()
  })

  it("displays checkout button with correct text", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={false}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đặt hàng/ })
    expect(checkoutButton).toBeInTheDocument()
    expect(checkoutButton).not.toBeDisabled()
  })

  it("displays loading state when submitting", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={true}
        isDisabled={false}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đang xử lý/ })
    expect(checkoutButton).toBeInTheDocument()
    expect(checkoutButton).toBeDisabled()
  })

  it("disables button when isDisabled is true", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={true}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đặt hàng/ })
    expect(checkoutButton).toBeDisabled()
  })

  it("disables button when both submitting and disabled", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={true}
        isDisabled={true}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đang xử lý/ })
    expect(checkoutButton).toBeDisabled()
  })

  it("calls onCheckout when button is clicked", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={false}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đặt hàng/ })
    fireEvent.click(checkoutButton)

    expect(mockOnCheckout).toHaveBeenCalledTimes(1)
  })

  it("renders back to cart link", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={false}
        onCheckout={mockOnCheckout}
      />
    )

    const backLink = screen.getByText("Quay lại giỏ hàng")
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest("a")).toHaveAttribute("href", "/cart")
  })

  it("does not call onCheckout when button is disabled", () => {
    render(
      <CheckoutActions
        total={399800}
        isSubmitting={false}
        isDisabled={true}
        onCheckout={mockOnCheckout}
      />
    )

    const checkoutButton = screen.getByRole("button", { name: /Đặt hàng/ })
    fireEvent.click(checkoutButton)

    expect(mockOnCheckout).not.toHaveBeenCalled()
  })
})

