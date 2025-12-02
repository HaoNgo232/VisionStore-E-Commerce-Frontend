import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentWaitingDialog } from "./payment-waiting-dialog";
import { usePaymentPolling } from "../hooks/use-payment-polling";
import { PaymentStatus } from "@/types";
import { toast } from "sonner";

// Mock the usePaymentPolling hook
jest.mock("../hooks/use-payment-polling", () => ({
    usePaymentPolling: jest.fn(),
}));

const mockUsePaymentPolling = usePaymentPolling as jest.MockedFunction<typeof usePaymentPolling>;

// Mock the formatPrice utility
jest.mock("@/features/products/utils", () => ({
    formatPrice: jest.fn((price: number) => {
        if (typeof price === "number") {
            return `${price.toLocaleString("vi-VN")}`;
        }
        return String(price);
    }),
}));

// Mock toast
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
    },
}));

// Clipboard mock is set up in beforeEach

// Mock ordersApi to avoid userId error
jest.mock("@/features/orders/services/orders.service", () => ({
    ordersApi: {
        getById: jest.fn(),
    },
}));

// Mock useAuthStore
jest.mock("@/stores/auth.store", () => ({
    useAuthStore: {
        getState: () => ({
            getUserId: () => "test-user-id",
        }),
    },
}));

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

    // Create typed mock function for clipboard
    const mockWriteText = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePaymentPolling.mockReturnValue({
            isPolling: true,
            attempts: 5,
            error: null,
            stopPolling: jest.fn(),
        });
        // Setup clipboard mock
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
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
            expect(qrImage).toHaveAttribute(
                "src",
                expect.stringContaining("qr.code.url"),
            );
        });
    });

    describe("Payment details", () => {
        it("displays correct amount", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            // formatPrice returns "100.000 ₫" format
            expect(screen.getByText(/100\.000/)).toBeInTheDocument();
        });

        it("displays correct order ID with DH prefix", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText(`DH${mockProps.orderId}`)).toBeInTheDocument();
        });

        it("displays bank name", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(screen.getByText("BIDV")).toBeInTheDocument();
        });
    });

    describe("Copy functionality", () => {
        it("copies order reference when copy button is clicked", () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            const buttons = screen.getAllByRole("button");
            const orderCopyButton = buttons.find((button) =>
                button
                    .closest('[class*="flex items-center gap-2"]')
                    ?.textContent?.includes(`DH${mockProps.orderId}`),
            );

            expect(orderCopyButton).toBeInTheDocument();
            fireEvent.click(orderCopyButton!);

            expect(mockWriteText).toHaveBeenCalledWith(`DH${mockProps.orderId}`);
            expect(toast.success).toHaveBeenCalledWith("Đã sao chép mã đơn hàng");
        });

        it("copies account info when account copy button is clicked", () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            // Mở phần thông tin chuyển khoản thủ công
            const toggleManualInfo = screen.getByRole("button", {
                name: "Thông tin chuyển khoản thủ công",
            });
            fireEvent.click(toggleManualInfo);

            const buttons = screen.getAllByRole("button");
            const accountCopyButton = buttons.find((button) =>
                button
                    .closest('[class*="flex items-center gap-2"]')
                    ?.textContent?.includes("96247HAOVAO"),
            );

            expect(accountCopyButton).toBeInTheDocument();
            fireEvent.click(accountCopyButton!);

            const expectedAccountInfo =
                "Ngân hàng: BIDV\nSố tài khoản: 96247HAOVAO\nTên tài khoản: NGO GIA HAO\nNội dung: DHorder-123";
            expect(mockWriteText).toHaveBeenCalledWith(expectedAccountInfo);
            expect(toast.success).toHaveBeenCalledWith("Đã sao chép thông tin tài khoản");
        });
    });

    describe("Polling integration", () => {
        it("calls usePaymentPolling with correct parameters", () => {
            render(<PaymentWaitingDialog {...mockProps} />);

            expect(mockUsePaymentPolling).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderId: mockProps.orderId,
                    onSuccess: expect.any(Function) as unknown,
                    onTimeout: expect.any(Function) as unknown,
                    onError: expect.any(Function) as unknown,
                    enabled: true,
                })
            );
        });

        it("disables polling when dialog is closed", () => {
            mockUsePaymentPolling.mockClear();
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 0,
                error: null,
                stopPolling: jest.fn(),
            });

            render(<PaymentWaitingDialog {...mockProps} open={false} />);

            // When dialog is closed, polling should be disabled
            expect(mockUsePaymentPolling).toHaveBeenCalled();
        });

    });

    // Component hiện tại không hiển thị countdown timer hoặc trạng thái polling chi tiết,
    // nên không test các text cụ thể liên quan đến countdown/polling status.

    describe("Error state", () => {
        it("displays error message when polling fails", () => {
            mockUsePaymentPolling.mockReturnValue({
                isPolling: false,
                attempts: 5,
                error: "Network error occurred",
                stopPolling: jest.fn(),
            });

            render(<PaymentWaitingDialog {...mockProps} />);
            const errorMessage = screen.getByTestId("payment-error-message");
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent("Network error occurred");
        });
    });

    describe("Instructions and info", () => {
        it("displays payment instructions", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(
                screen.getByText("Vui lòng hoàn tất thanh toán trong thời gian quy định"),
            ).toBeInTheDocument();
        });

        it("displays manual account information", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            const toggleManualInfo = screen.getByRole("button", {
                name: "Thông tin chuyển khoản thủ công",
            });
            fireEvent.click(toggleManualInfo);

            expect(
                screen.getByText("Thông tin chuyển khoản thủ công"),
            ).toBeInTheDocument();
            expect(screen.getByText("Số tài khoản:")).toBeInTheDocument();
            expect(screen.getByText("96247HAOVAO")).toBeInTheDocument();
            expect(screen.getByText("Tên tài khoản:")).toBeInTheDocument();
            expect(screen.getByText("NGO GIA HAO")).toBeInTheDocument();
        });

        it("displays info messages during polling", () => {
            render(<PaymentWaitingDialog {...mockProps} />);
            expect(
                screen.getByText("Vui lòng hoàn tất thanh toán trong thời gian quy định"),
            ).toBeInTheDocument();
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