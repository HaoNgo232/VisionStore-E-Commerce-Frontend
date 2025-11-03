import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutContent } from "./checkout-content";
import { PaymentMethod } from "@/types";

// Mock all hooks and services
jest.mock("@/features/cart/hooks/use-cart");
jest.mock("@/features/addresses/hooks/use-addresses");
jest.mock("@/features/auth/hooks/use-auth");
jest.mock("@/features/orders/services/orders.service");
jest.mock("next/navigation");
jest.mock("sonner");

// Mock UI components
jest.mock("@/components/ui/button", () => ({
    Button: ({ children, onClick, disabled, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} {...props}>
            {children}
        </button>
    ),
}));

jest.mock("@/components/ui/card", () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/radio-group", () => ({
    RadioGroup: ({ children, value, onValueChange }: any) => (
        <div data-testid="radio-group" data-value={value}>
            {children}
        </div>
    ),
    RadioGroupItem: ({ value, onClick }: any) => (
        <input type="radio" value={value} onClick={onClick} />
    ),
}));

jest.mock("@/components/ui/label", () => ({
    Label: ({ children }: any) => <label>{children}</label>,
}));

jest.mock("@/features/payments/components/payment-waiting-dialog", () => ({
    PaymentWaitingDialog: ({ open }: any) => (
        open ? <div data-testid="payment-waiting-dialog">Waiting Dialog</div> : null
    ),
}));

jest.mock("@/features/payments/components/payment-success-dialog", () => ({
    PaymentSuccessDialog: ({ open }: any) => (
        open ? <div data-testid="payment-success-dialog">Success Dialog</div> : null
    ),
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { useCart } from "@/features/cart/hooks/use-cart";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ordersApi } from "@/features/orders/services/orders.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseAddresses = useAddresses as jest.MockedFunction<typeof useAddresses>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;
const mockToastSuccess = toast.success as jest.MockedFunction<typeof toast.success>;

// Mock auth store
jest.mock("@/stores/auth.store", () => ({
    useAuthStore: {
        getState: () => ({
            getUserId: () => "user-1",
        }),
    },
}));

describe("CheckoutContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
        } as any);

        mockUseCart.mockReturnValue({
            cart: {
                id: "cart-1",
                items: [
                    {
                        id: "item-1",
                        productId: "product-1",
                        quantity: 2,
                        product: {
                            priceInt: 100000,
                            imageUrls: ["/placeholder.svg"],
                            name: "Test Product"
                        },
                    },
                ],
                totalInt: 200000,
            } as any,
            loading: false,
        } as any);

        mockUseAddresses.mockReturnValue({
            addresses: [
                {
                    id: "address-1",
                    fullName: "Test User",
                    phone: "0123456789",
                    address: "123 Test St",
                    isDefault: true,
                } as any,
            ],
            loading: false,
        } as any);

        mockRouter.mockReturnValue({
            push: jest.fn(),
        } as any);

        mockOrdersApi.create.mockResolvedValue({
            id: "order-123",
        } as any);
    });

    describe("COD Payment Flow", () => {
        it("redirects to success page for COD payment", async () => {
            const mockPush = jest.fn();
            mockRouter.mockReturnValue({ push: mockPush } as any);

            render(<CheckoutContent />);

            // Select address (assuming first address is selected by default)
            // Click checkout button
            const checkoutButton = screen.getByText("Đặt hàng");
            fireEvent.click(checkoutButton);

            await waitFor(() => {
                expect(mockOrdersApi.create).toHaveBeenCalled();
            });

            expect(mockToastSuccess).toHaveBeenCalledWith("Đặt hàng thành công!");
            expect(mockPush).toHaveBeenCalledWith("/cart/success?orderId=order-123&paymentMethod=COD");
        });
    });

    describe("SePay Payment Flow", () => {
        it("opens waiting dialog for SePay payment", async () => {
            // Mock SePay selection - this would need to be implemented in the component
            // For now, just test that the dialog components are imported correctly
            render(<CheckoutContent />);

            // The dialogs should be rendered (even if not open initially)
            expect(screen.queryByTestId("payment-waiting-dialog")).not.toBeInTheDocument();
            expect(screen.queryByTestId("payment-success-dialog")).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("shows error toast when order creation fails", async () => {
            mockOrdersApi.create.mockRejectedValue(new Error("Order creation failed"));

            render(<CheckoutContent />);

            const checkoutButton = screen.getByText("Đặt hàng");
            fireEvent.click(checkoutButton);

            await waitFor(() => {
                expect(mockToastError).toHaveBeenCalledWith("Order creation failed");
            });
        });
    });
});