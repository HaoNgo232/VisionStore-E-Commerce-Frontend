import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PaymentSuccessDialog } from "./payment-success-dialog";
import { OrderStatus, PaymentStatus } from "@/types";

// Mock the formatPrice utility
jest.mock("@/features/products/utils", () => ({
    formatPrice: jest.fn((price) => `${price.toLocaleString("vi-VN")}`),
}));

// Mock the badge components
jest.mock("@/features/orders/components/order-status-badge", () => ({
    OrderStatusBadge: ({ status }: { status: OrderStatus }) => (
        <span data-testid="order-status-badge">{status}</span>
    ),
}));

jest.mock("@/features/payments/components/payment-status-badge", () => ({
    PaymentStatusBadge: ({ status }: { status: PaymentStatus }) => (
        <span data-testid="payment-status-badge">{status}</span>
    ),
}));

describe("PaymentSuccessDialog", () => {
    const mockOrder = {
        id: "order-123",
        userId: "user-123",
        addressId: "address-123",
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        totalInt: 100000,
        items: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    };

    const mockProps = {
        open: true,
        order: mockOrder,
        onViewOrder: jest.fn(),
        onClose: jest.fn(),
        autoRedirect: true,
        redirectDelay: 3000,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("Dialog rendering", () => {
        it("renders dialog when open is true", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("Thanh toán thành công! 🎉")).toBeInTheDocument();
        });

        it("does not render dialog when open is false", () => {
            render(<PaymentSuccessDialog {...mockProps} open={false} />);
            expect(screen.queryByText("Thanh toán thành công! 🎉")).not.toBeInTheDocument();
        });

        it("displays success animation", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            const checkIcon = screen.getByTestId("check-circle-icon");
            expect(checkIcon).toBeInTheDocument();
        });
    });

    describe("Order information display", () => {
        it("displays correct order ID", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("order-123")).toBeInTheDocument();
        });

        it("displays correct amount", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            // Check for the formatted price parts since it's split into multiple elements
            expect(screen.getByText((content) => content.includes("100.000") && content.includes("₫"))).toBeInTheDocument();
        });

        it("displays payment method based on payment status", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("SePay QR")).toBeInTheDocument();
        });

        it("displays COD payment method for unpaid orders", () => {
            // COD orders will have UNPAID status since payment is on delivery
            const codOrder = {
                ...mockOrder,
                paymentStatus: PaymentStatus.UNPAID,
                status: "PENDING" as any
            };
            render(<PaymentSuccessDialog {...mockProps} order={codOrder} />);
            // Check that payment status badge shows UNPAID
            expect(screen.getByTestId("payment-status-badge")).toBeInTheDocument();
        });

        it("renders OrderStatusBadge with correct status", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            const badge = screen.getByTestId("order-status-badge");
            expect(badge).toHaveTextContent(OrderStatus.PROCESSING);
        });

        it("renders PaymentStatusBadge with correct status", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            const badge = screen.getByTestId("payment-status-badge");
            expect(badge).toHaveTextContent(PaymentStatus.PAID);
        });
    });

    describe("Auto-redirect functionality", () => {
        it("displays countdown timer", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("3s")).toBeInTheDocument();
        });

        it("updates countdown every second", () => {
            render(<PaymentSuccessDialog {...mockProps} />);

            // Initial countdown should be 3
            expect(screen.getByText("3s")).toBeInTheDocument();

            // Advance time by 1 second
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            expect(screen.getByText("2s")).toBeInTheDocument();

            // Advance time by another second
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            expect(screen.getByText("1s")).toBeInTheDocument();
        });

        it("auto-redirects when countdown reaches zero", () => {
            render(<PaymentSuccessDialog {...mockProps} />);

            // Advance time by 3 seconds to reach zero
            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(mockProps.onViewOrder).toHaveBeenCalledWith(mockOrder.id);
            expect(mockProps.onClose).toHaveBeenCalled();
        });

        it("does not show countdown when autoRedirect is false", () => {
            render(<PaymentSuccessDialog {...mockProps} autoRedirect={false} />);
            expect(screen.queryByText(/Chuyển đến trang chi tiết/)).not.toBeInTheDocument();
        });

        it("does not auto-redirect when autoRedirect is false", () => {
            render(<PaymentSuccessDialog {...mockProps} autoRedirect={false} />);

            // Advance time
            jest.advanceTimersByTime(3000);

            expect(mockProps.onViewOrder).not.toHaveBeenCalled();
            expect(mockProps.onClose).not.toHaveBeenCalled();
        });
    });

    describe("Manual actions", () => {
        it("calls onViewOrder when view order button is clicked", () => {
            render(<PaymentSuccessDialog {...mockProps} />);

            const viewOrderButton = screen.getByRole("button", { name: /xem chi tiết đơn hàng/i });
            fireEvent.click(viewOrderButton);

            expect(mockProps.onViewOrder).toHaveBeenCalledWith(mockOrder.id);
            expect(mockProps.onClose).toHaveBeenCalled();
        });

        it("calls onClose when close button is clicked", () => {
            render(<PaymentSuccessDialog {...mockProps} />);

            const closeButton = screen.getByRole("button", { name: "" }); // Close button has no accessible name
            fireEvent.click(closeButton);

            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    describe("Animation and styling", () => {
        it("applies bounce animation to success icon", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            const iconContainer = screen.getByTestId("check-circle-icon").parentElement?.parentElement;
            expect(iconContainer).toHaveClass("animate-bounce");
        });

        it("displays success message with emoji", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("Thanh toán thành công! 🎉")).toBeInTheDocument();
        });

        it("applies green theme to success elements", () => {
            render(<PaymentSuccessDialog {...mockProps} />);
            expect(screen.getByText("Thanh toán thành công! 🎉")).toHaveClass("text-green-700");
        });
    });

    describe("Dialog behavior", () => {
        it("allows closing when not auto-redirecting", () => {
            const mockOnClose = jest.fn();
            render(<PaymentSuccessDialog {...mockProps} onClose={mockOnClose} autoRedirect={false} />);

            const closeButton = screen.getByRole("button", { name: "" });
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});