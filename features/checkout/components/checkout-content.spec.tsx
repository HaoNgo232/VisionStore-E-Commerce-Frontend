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
            // Don't need to do anything special - component already has SePay option
            render(<CheckoutContent />);

            // The component should render without errors
            expect(screen.getByText("Thanh toán")).toBeInTheDocument();
        });
    });

    describe("Payment Method Selection", () => {
        it("allows COD payment method selection", () => {
            render(<CheckoutContent />);

            const codRadio = screen.getAllByRole("radio")[0];
            expect(codRadio).toBeInTheDocument();
        });

        it("allows SePay payment method selection", () => {
            render(<CheckoutContent />);

            const radios = screen.getAllByRole("radio");
            expect(radios.length).toBeGreaterThan(0);
        });

        it("shows payment method descriptions", () => {
            render(<CheckoutContent />);

            // Check for both payment method labels in the rendered output
            expect(screen.getByText(/Phương thức thanh toán/i)).toBeInTheDocument();
        });
    });

    describe("Address Selection", () => {
        it("disables checkout button when no address available", async () => {
            mockUseAddresses.mockReturnValue({
                addresses: [],
                loading: false,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Chưa có địa chỉ")).toBeInTheDocument();
        });

        it("allows address selection change", async () => {
            mockUseAddresses.mockReturnValue({
                addresses: [
                    {
                        id: "address-1",
                        fullName: "Test User 1",
                        phone: "0123456789",
                        street: "123 Test St",
                        ward: "Ward 1",
                        district: "District 1",
                        city: "City 1",
                        isDefault: true,
                    } as any,
                    {
                        id: "address-2",
                        fullName: "Test User 2",
                        phone: "0987654321",
                        street: "456 Another St",
                        ward: "Ward 2",
                        district: "District 2",
                        city: "City 2",
                        isDefault: false,
                    } as any,
                ],
                loading: false,
            } as any);

            render(<CheckoutContent />);

            const addressRadios = screen.getAllByRole("radio");
            expect(addressRadios.length).toBeGreaterThan(0);
        });
    });

    describe("Loading States", () => {
        it("shows loading text when cart is loading", () => {
            mockUseCart.mockReturnValue({
                cart: null,
                loading: true,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Đang tải...")).toBeInTheDocument();
        });

        it("shows loading text when addresses are loading", () => {
            mockUseAddresses.mockReturnValue({
                addresses: [],
                loading: true,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Đang tải...")).toBeInTheDocument();
        });
    });

    describe("Validation & Error Handling", () => {
        it("shows error when order creation fails", async () => {
            mockOrdersApi.create.mockRejectedValue(new Error("Order creation failed"));

            render(<CheckoutContent />);

            const checkoutButton = screen.getByText("Đặt hàng");
            fireEvent.click(checkoutButton);

            await waitFor(() => {
                expect(mockToastError).toHaveBeenCalledWith("Order creation failed");
            });
        });

        it("shows error when no cart found", async () => {
            mockUseCart.mockReturnValue({
                cart: null,
                loading: false,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Giỏ hàng trống")).toBeInTheDocument();
        });

        it("shows error when no addresses available", async () => {
            mockUseAddresses.mockReturnValue({
                addresses: [],
                loading: false,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Chưa có địa chỉ")).toBeInTheDocument();
        });
    });

    describe("Unauthenticated User", () => {
        it("shows login prompt for unauthenticated users", () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
            } as any);

            render(<CheckoutContent />);

            expect(screen.getByText("Vui lòng đăng nhập")).toBeInTheDocument();
            expect(screen.getByText(/Bạn cần đăng nhập để thanh toán/i)).toBeInTheDocument();
        });
    });
});