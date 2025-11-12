/**
 * Checkout Service Tests
 * Unit tests for checkout business logic
 */

import { checkoutService } from "./checkout.service"
import { ordersApi } from "@/features/orders/services/orders.service"
import { paymentsApi } from "@/features/payments/services/payments.service"
import { PaymentMethod, PaymentStatus, OrderStatus } from "@/types"
import type { Cart, CartItem } from "@/types"

// Mock dependencies
jest.mock("@/features/orders/services/orders.service")
jest.mock("@/features/payments/services/payments.service")

describe("CheckoutService", () => {
  const mockAddressId = "addr-123"
  const mockOrderId = "order-123"
  const mockPaymentId = "payment-123"

  const mockProduct = {
    id: "product-123",
    name: "Test Product",
    priceInt: 199900,
    imageUrls: ["https://example.com/image.jpg"],
  }

  const mockCartItem: CartItem = {
    id: "item-123",
    cartId: "cart-123",
    productId: mockProduct.id,
    quantity: 2,
    product: mockProduct,
  }

  const mockCart: Cart = {
    id: "cart-123",
    sessionId: "session-123",
    userId: "user-123",
    items: [mockCartItem],
    totalInt: 399800, // 2 * 199900
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }

  const mockOrder = {
    id: mockOrderId,
    userId: "user-123",
    addressId: mockAddressId,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    totalInt: 399800,
    items: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("validateCheckoutRequest", () => {
    it("should return errors when addressId is empty", () => {
      const result = checkoutService.validateCheckoutRequest(mockCart, "")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Vui lòng chọn địa chỉ giao hàng")
    })

    it("should return errors when cart is null", () => {
      const result = checkoutService.validateCheckoutRequest(null, mockAddressId)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Giỏ hàng trống")
    })

    it("should return errors when cart has no items", () => {
      const emptyCart: Cart = {
        ...mockCart,
        items: [],
      }
      const result = checkoutService.validateCheckoutRequest(
        emptyCart,
        mockAddressId
      )
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Giỏ hàng trống")
    })

    it("should return errors when cart items have invalid product data", () => {
      const invalidCart: Cart = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            product: {
              ...mockProduct,
              priceInt: undefined as unknown as number,
            },
          },
        ],
      }
      const result = checkoutService.validateCheckoutRequest(
        invalidCart,
        mockAddressId
      )
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        "Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng làm mới trang."
      )
    })

    it("should return errors when totalInt is invalid", () => {
      const invalidCart: Cart = {
        ...mockCart,
        totalInt: 0,
      }
      const result = checkoutService.validateCheckoutRequest(
        invalidCart,
        mockAddressId
      )
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Tổng giá trị đơn hàng không hợp lệ")
    })

    it("should return errors when totalInt is negative", () => {
      const invalidCart: Cart = {
        ...mockCart,
        totalInt: -100,
      }
      const result = checkoutService.validateCheckoutRequest(
        invalidCart,
        mockAddressId
      )
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Tổng giá trị đơn hàng không hợp lệ")
    })

    it("should return valid when all checks pass", () => {
      const result = checkoutService.validateCheckoutRequest(
        mockCart,
        mockAddressId
      )
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should return multiple errors when multiple validations fail", () => {
      const invalidCart: Cart = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            product: {
              ...mockProduct,
              priceInt: undefined as unknown as number,
            },
          },
        ],
        totalInt: 0,
      }
      const result = checkoutService.validateCheckoutRequest(
        invalidCart,
        ""
      )
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe("processCodCheckout", () => {
    it("should create order and return orderId", async () => {
      ;(ordersApi.create as jest.Mock).mockResolvedValue(mockOrder)

      const result = await checkoutService.processCodCheckout(
        mockAddressId,
        mockCart
      )

      expect(ordersApi.create).toHaveBeenCalledWith({
        addressId: mockAddressId,
        items: [
          {
            productId: mockCartItem.productId,
            quantity: mockCartItem.quantity,
            priceInt: mockProduct.priceInt,
          },
        ],
      })
      expect(result.orderId).toBe(mockOrderId)
    })

    it("should handle items with missing product price", async () => {
      const cartWithMissingPrice: Cart = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            product: {
              ...mockProduct,
              priceInt: undefined as unknown as number,
            },
          },
        ],
      }
      ;(ordersApi.create as jest.Mock).mockResolvedValue(mockOrder)

      const result = await checkoutService.processCodCheckout(
        mockAddressId,
        cartWithMissingPrice
      )

      expect(ordersApi.create).toHaveBeenCalledWith({
        addressId: mockAddressId,
        items: [
          {
            productId: mockCartItem.productId,
            quantity: mockCartItem.quantity,
            priceInt: 0,
          },
        ],
      })
      expect(result.orderId).toBe(mockOrderId)
    })

    it("should propagate errors from ordersApi.create", async () => {
      const error = new Error("Failed to create order")
      ;(ordersApi.create as jest.Mock).mockRejectedValue(error)

      await expect(
        checkoutService.processCodCheckout(mockAddressId, mockCart)
      ).rejects.toThrow("Failed to create order")
    })
  })

  describe("processSepayCheckout", () => {
    const mockPaymentResponse = {
      paymentId: mockPaymentId,
      qrCode: "00020101021202031050...",
    }

    it("should create order and process payment, then return all data", async () => {
      ;(ordersApi.create as jest.Mock).mockResolvedValue(mockOrder)
      ;(paymentsApi.process as jest.Mock).mockResolvedValue(mockPaymentResponse)

      const result = await checkoutService.processSepayCheckout(
        mockAddressId,
        mockCart
      )

      expect(ordersApi.create).toHaveBeenCalledWith({
        addressId: mockAddressId,
        items: [
          {
            productId: mockCartItem.productId,
            quantity: mockCartItem.quantity,
            priceInt: mockProduct.priceInt,
          },
        ],
      })
      expect(paymentsApi.process).toHaveBeenCalledWith(
        mockOrderId,
        PaymentMethod.SEPAY,
        mockCart.totalInt
      )
      expect(result).toEqual({
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        qrCode: mockPaymentResponse.qrCode,
      })
    })

    it("should handle missing qrCode in payment response", async () => {
      const paymentResponseWithoutQr = {
        paymentId: mockPaymentId,
        qrCode: null as unknown as string,
      }
      ;(ordersApi.create as jest.Mock).mockResolvedValue(mockOrder)
      ;(paymentsApi.process as jest.Mock).mockResolvedValue(
        paymentResponseWithoutQr
      )

      const result = await checkoutService.processSepayCheckout(
        mockAddressId,
        mockCart
      )

      expect(result.qrCode).toBe("")
    })

    it("should propagate errors from ordersApi.create", async () => {
      const error = new Error("Failed to create order")
      ;(ordersApi.create as jest.Mock).mockRejectedValue(error)

      await expect(
        checkoutService.processSepayCheckout(mockAddressId, mockCart)
      ).rejects.toThrow("Failed to create order")
      expect(paymentsApi.process).not.toHaveBeenCalled()
    })

    it("should propagate errors from paymentsApi.process", async () => {
      const error = new Error("Failed to process payment")
      ;(ordersApi.create as jest.Mock).mockResolvedValue(mockOrder)
      ;(paymentsApi.process as jest.Mock).mockRejectedValue(error)

      await expect(
        checkoutService.processSepayCheckout(mockAddressId, mockCart)
      ).rejects.toThrow("Failed to process payment")
    })
  })
})

