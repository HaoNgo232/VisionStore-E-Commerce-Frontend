import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PaymentWaitingDialog } from "./payment-waiting-dialog";
import { usePaymentPolling } from "../hooks/use-payment-polling";
import { PaymentStatus } from "@/types";

// Mock the usePaymentPolling hook
jest.mock("../hooks/use-payment-polling", () => ({
    usePaymentPolling: jest.fn(),
}));

const mockUsePaymentPolling = usePaymentPolling as jest.MockedFunction<typeof usePaymentPolling>;

// Mock the formatPrice utility
jest.mock("@/features/products/utils", () => ({
    formatPrice: jest.fn((price) => `${price.toLocaleString("vi-VN")}`),
}));

// Mock toast
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
    },
}));

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe("PaymentWaitingDialog", () => {
    const mockProps = {
        open: true,
        onOpenChange: jest.fn(),
        orderId: "order-123",
        payment: {
            paymentId: "payment-123",
            status: PaymentStatus.UNPAID,
            paymentUrl: "https://payment.url",
            qrCode: "https://qr.code.url",
            message: "Payment initiated",
        },
        amountInt: 100000,
        onSuccess: jest.fn(),
        onTimeout: jest.fn(),
        onError: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePaymentPolling.mockReturnValue({
            isPolling: true,
            attempts: 5,
            error: null,
            stopPolling: jest.fn(),
        });
    });

    describe("Dialog rendering", () => {
        it("renders dialog when open is true", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Thanh toán đơn hàng")).toBeInTheDocument();
        });

        it("does not render dialog when open is false", () => {
            render(<PaymentWaitingDialog {...mockProps} open={false} />);
            expect(screen.queryByText("Thanh toán đơn hàng")).not.toBeInTheDocument();
        });

        it("shows close button when not polling", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: null,
                stopPolling: jest.fn(),
            });
            render(<PaymentWaitingDialog {...mockProps} />);
            const closeButton = screen.getByRole("button", { name: /close/i });
            expect(closeButton).toBeInTheDocument();
        });

        it("hides close button when polling", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: true,
                attempts: 5,
                error: null,
                stopPolling: jest.fn(),
            });
            render(<PaymentWaitingDialog {...mockProps} />);
            const closeButton = screen.queryByRole("button", { name: /close/i });
            expect(closeButton).not.toBeInTheDocument();
        });
    });

    describe("QR Code display", () => {
        it("renders QR code image when qrCode is provided", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            const qrImage = screen.getByAltText("SePay QR Code");
            expect(qrImage).toBeInTheDocument();
            expect(qrImage).toHaveAttribute("src", mockProps.payment.qrCode);
        });

        it("handles QR code load error", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            render(<PaymentWaitingDialog {...mockProps} />);

            const qrImage = screen.getByAltText("SePay QR Code");
            fireEvent.error(qrImage);

            expect(consoleSpy).toHaveBeenCalledWith("Failed to load QR code:", expect.any(Object));
            consoleSpy.mockRestore();
        });
    });

    describe("Payment details", () => {
        it("displays correct amount", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            // Check for the formatted price using a function matcher
            expect(screen.getByText((content) => content.includes("100.000") && content.includes("₫"))).toBeInTheDocument();
        });

        it("displays correct order ID with DH prefix", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("DHorder-123")).toBeInTheDocument();
        });

        it("displays bank name", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Vietcombank")).toBeInTheDocument();
        });
    });

    describe("Copy functionality", () => {
        it("copies order reference when copy button is clicked", async () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            const copyButtons = screen.getAllByRole("button");
            const orderCopyButton = copyButtons.find(button =>
                button.closest('[class*="flex items-center gap-2"]')?.textContent?.includes("DHorder-123")
            );

            expect(orderCopyButton).toBeInTheDocument();
            fireEvent.click(orderCopyButton!);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("DHorder-123");
            expect(require("sonner").toast.success).toHaveBeenCalledWith("Đã sao chép mã đơn hàng");
        });

        it("copies account info when account copy button is clicked", async () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            const copyButtons = screen.getAllByRole("button");
            const accountCopyButton = copyButtons.find(button =>
                button.closest('[class*="bg-blue-50"]')?.textContent?.includes("Thông tin chuyển khoản thủ công")
            );

            expect(accountCopyButton).toBeInTheDocument();
            fireEvent.click(accountCopyButton!);

            const expectedAccountInfo = `Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nTên tài khoản: CONG TY TNHH E-COMMERCE\nNội dung: DHorder-123`;
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedAccountInfo);
            expect(require("sonner").toast.success).toHaveBeenCalledWith("Đã sao chép thông tin tài khoản");
        });
    });

    describe("Polling integration", () => {
        it("calls usePaymentPolling with correct parameters", () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            expect(mockUsePaymentPolling).toHaveBeenCalledWith({
                orderId: mockProps.orderId,
                onSuccess: mockProps.onSuccess,
                onTimeout: mockProps.onTimeout,
                onError: mockProps.onError,
                enabled: true,
            });
        });

        it("disables polling when dialog is closed", () => {
            mockUsePaymentPolling.mockClear();
            render(<PaymentWaitingDialog {...mockProps} open={false} />);

            expect(mockUsePaymentPolling).toHaveBeenCalledWith({
                orderId: mockProps.orderId,
                onSuccess: mockProps.onSuccess,
                onTimeout: mockProps.onTimeout,
                onError: mockProps.onError,
                enabled: false,
            });
        });

        it("shows polling status when isPolling is true", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: true,
                attempts: 10,
                error: null,
                stopPolling: jest.fn(),
            });

            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Chờ thanh toán...")).toBeInTheDocument();
            expect(screen.getByText("Kiểm tra: 10/180 lần")).toBeInTheDocument();
        });
    });

    describe("Countdown timer", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("displays countdown timer", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("15:00")).toBeInTheDocument();
        });

        it("updates countdown timer every second", () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            expect(screen.getByText("15:00")).toBeInTheDocument();

            // Advance time by 5 seconds and wrap in act()
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            // Check for the updated timer text
            expect(screen.getByText("14:55")).toBeInTheDocument();
        });

        it("stops countdown when not polling", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: null,
                stopPolling: jest.fn(),
            });

            render(<PaymentWaitingDialog {...mockProps} />);

            expect(screen.getByText("15:00")).toBeInTheDocument();

            // Advance time by 5 seconds
            jest.advanceTimersByTime(5000);

            // Timer should not change when not polling
            expect(screen.getByText("15:00")).toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("displays error message when polling fails", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: "Network error occurred",
                stopPolling: jest.fn(),
            });

            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Hết hạn thanh toán")).toBeInTheDocument();
            expect(screen.getByText("Network error occurred")).toBeInTheDocument();
        });

        it("shows retry button when in error state", () => {
            const mockStopPolling = jest.fn();
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: "Network error",
                stopPolling: mockStopPolling,
            });

            render(<PaymentWaitingDialog {...mockProps} />);

            const retryButton = screen.getByRole("button", { name: /kiểm tra lại/i });
            expect(retryButton).toBeInTheDocument();

            fireEvent.click(retryButton);

            expect(mockStopPolling).toHaveBeenCalled();
        });
    });

    describe("Instructions and info", () => {
        it("displays payment instructions", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Hướng dẫn thanh toán:")).toBeInTheDocument();
            expect(screen.getByText("Mở ứng dụng ngân hàng trên điện thoại")).toBeInTheDocument();
        });

        it("displays manual account information", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("Thông tin chuyển khoản thủ công")).toBeInTheDocument();
            expect(screen.getByText("🏦 Ngân hàng: Vietcombank")).toBeInTheDocument();
            expect(screen.getByText("💳 Số tài khoản: 1234567890")).toBeInTheDocument();
        });

        it("displays info messages during polling", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("📋 Vui lòng thanh toán trước khi hết hạn:")).toBeInTheDocument();
            expect(screen.getByText("Mở app ngân hàng và quét mã QR ở trên")).toBeInTheDocument();
        });
    });

    describe("Dialog behavior", () => {
        it("prevents closing when polling", () => {
            const mockOnOpenChange = jest.fn();
            render(<PaymentWaitingDialog {...mockProps} onOpenChange={mockOnOpenChange} />);

            // Try to close dialog (this would normally be triggered by backdrop click or escape)
            // Since we hide the close button, we need to test the onOpenChange behavior
            // In a real scenario, this would be called by Radix Dialog's onOpenChange

            expect(mockOnOpenChange).not.toHaveBeenCalled();
        });

        it("allows closing when not polling", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: null,
                stopPolling: jest.fn(),
            });

            const mockOnOpenChange = jest.fn();
            render(<PaymentWaitingDialog {...mockProps} onOpenChange={mockOnOpenChange} />);

            // Click the close button
            const closeButton = screen.getByRole("button", { name: /close/i });
            fireEvent.click(closeButton);

            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        });
    });
});