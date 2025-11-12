/**
 * AddressSelector Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { AddressSelector } from "./address-selector"
import type { Address } from "@/types"

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe("AddressSelector", () => {
  const mockAddresses: Address[] = [
    {
      id: "addr-1",
      userId: "user-123",
      fullName: "Nguyễn Văn A",
      phone: "0123456789",
      street: "123 Đường ABC",
      ward: "Phường 1",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      isDefault: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "addr-2",
      userId: "user-123",
      fullName: "Trần Thị B",
      phone: "0987654321",
      street: "456 Đường XYZ",
      ward: "Phường 2",
      district: "Quận 2",
      city: "Hồ Chí Minh",
      isDefault: false,
      createdAt: "2025-01-02T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    },
  ]

  it("renders all addresses", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId=""
        onSelectAddress={onSelectAddress}
      />
    )

    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument()
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument()
    expect(screen.getByText("123 Đường ABC, Phường 1, Quận 1")).toBeInTheDocument()
    expect(screen.getByText("456 Đường XYZ, Phường 2, Quận 2")).toBeInTheDocument()
  })

  it("displays default address badge", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId=""
        onSelectAddress={onSelectAddress}
      />
    )

    expect(screen.getByText("Địa chỉ mặc định")).toBeInTheDocument()
  })

  it("calls onSelectAddress when address is selected", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId=""
        onSelectAddress={onSelectAddress}
      />
    )

    const firstRadio = screen.getByLabelText(/Nguyễn Văn A/)
    fireEvent.click(firstRadio)

    expect(onSelectAddress).toHaveBeenCalledWith("addr-1")
  })

  it("highlights selected address", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId="addr-2"
        onSelectAddress={onSelectAddress}
      />
    )

    const secondRadio = screen.getByLabelText(/Trần Thị B/)
    expect(secondRadio).toBeChecked()
  })

  it("renders link to manage addresses", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId=""
        onSelectAddress={onSelectAddress}
      />
    )

    const link = screen.getByText("Quản lý địa chỉ")
    expect(link).toBeInTheDocument()
    expect(link.closest("a")).toHaveAttribute("href", "/profile?tab=addresses")
  })

  it("renders empty state when no addresses", () => {
    const onSelectAddress = jest.fn()
    render(
      <AddressSelector
        addresses={[]}
        selectedAddressId=""
        onSelectAddress={onSelectAddress}
      />
    )

    expect(screen.getByText("Địa chỉ giao hàng")).toBeInTheDocument()
    expect(screen.queryByText("Nguyễn Văn A")).not.toBeInTheDocument()
  })
})

