/**
 * PaymentMethodSelector Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { PaymentMethodSelector } from "./payment-method-selector"
import { PaymentMethod } from "@/types"

describe("PaymentMethodSelector", () => {
  it("renders both payment methods", () => {
    const onSelectPayment = jest.fn()
    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.COD}
        onSelectPayment={onSelectPayment}
      />
    )

    expect(
      screen.getByText("Thanh toán khi nhận hàng (COD)")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Chuyển khoản ngân hàng (SePay)")
    ).toBeInTheDocument()
  })

  it("displays payment method descriptions", () => {
    const onSelectPayment = jest.fn()
    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.COD}
        onSelectPayment={onSelectPayment}
      />
    )

    expect(
      screen.getByText(
        "Thanh toán tiền mặt khi nhân viên giao hàng tới"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("Quét mã QR để thanh toán qua ngân hàng")
    ).toBeInTheDocument()
  })

  it("calls onSelectPayment when COD is selected", () => {
    const onSelectPayment = jest.fn()
    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.SEPAY}
        onSelectPayment={onSelectPayment}
      />
    )

    const codRadio = screen.getByLabelText(/COD/)
    fireEvent.click(codRadio)

    expect(onSelectPayment).toHaveBeenCalledWith(PaymentMethod.COD)
  })

  it("calls onSelectPayment when SePay is selected", () => {
    const onSelectPayment = jest.fn()
    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.COD}
        onSelectPayment={onSelectPayment}
      />
    )

    const sepayRadio = screen.getByLabelText(/SePay/)
    fireEvent.click(sepayRadio)

    expect(onSelectPayment).toHaveBeenCalledWith(PaymentMethod.SEPAY)
  })

  it("highlights selected payment method", () => {
    const onSelectPayment = jest.fn()
    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.SEPAY}
        onSelectPayment={onSelectPayment}
      />
    )

    const sepayRadio = screen.getByLabelText(/SePay/)
    expect(sepayRadio).toBeChecked()
  })

  it("falls back to COD when invalid value is provided", () => {
    const onSelectPayment = jest.fn()
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()

    render(
      <PaymentMethodSelector
        selectedPayment={PaymentMethod.COD}
        onSelectPayment={onSelectPayment}
      />
    )

    // Simulate invalid value
    const radioGroup = screen.getByRole("radiogroup")
    fireEvent.change(radioGroup, { target: { value: "INVALID" } })

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(onSelectPayment).toHaveBeenCalledWith(PaymentMethod.COD)

    consoleWarnSpy.mockRestore()
  })
})

