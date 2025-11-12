/**
 * CheckoutContent Component
 * Main orchestrator component for checkout flow
 * Uses composition pattern with smaller components and custom hooks
 */

"use client"

import { useEffect } from "react"
import type { JSX } from "react"
import Link from "next/link"
import { useCart } from "@/features/cart/hooks/use-cart"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { PaymentWaitingDialog } from "@/features/payments/components/payment-waiting-dialog"
import { PaymentStatus } from "@/types"
import { useCheckout } from "../hooks/use-checkout"
import { AddressSelector } from "./address-selector"
import { PaymentMethodSelector } from "./payment-method-selector"
import { OrderSummary } from "./order-summary"
import { CheckoutActions } from "./checkout-actions"

export default function CheckoutContent(): JSX.Element {
    const { isAuthenticated } = useAuth()
    const { cart, loading: cartLoading, clearCart } = useCart()
    const { addresses, loading: addressesLoading } = useAddresses()

    const {
        state,
        updateState,
        paymentDialog,
        setPaymentDialog,
        handleCheckout,
        handlePaymentSuccess,
        handlePaymentTimeout,
        handlePaymentError,
    } = useCheckout(cart, clearCart)

    // Set default address when addresses are loaded
    useEffect(() => {
        if (!state.selectedAddressId && addresses.length > 0 && addresses[0]) {
            updateState({ selectedAddressId: addresses[0].id })
        }
    }, [state.selectedAddressId, addresses, updateState])

    // Early returns for loading and validation states
    if (!isAuthenticated) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1>
                <p className="text-muted-foreground mt-2">
                    Bạn cần đăng nhập để thanh toán
                </p>
                <Link
                    href="/auth/login"
                    className="text-primary hover:underline mt-4 inline-block"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        )
    }

    if (!cartLoading && (!cart || cart.items.length === 0)) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
                <p className="text-muted-foreground mt-2">
                    Không có sản phẩm để thanh toán
                </p>
                <Link
                    href="/products"
                    className="text-primary hover:underline mt-4 inline-block"
                >
                    Quay lại mua sắm
                </Link>
            </div>
        )
    }

    if (!addressesLoading && addresses.length === 0) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Chưa có địa chỉ</h1>
                <p className="text-muted-foreground mt-2">
                    Vui lòng thêm địa chỉ giao hàng trước
                </p>
                <Link
                    href="/profile?tab=addresses"
                    className="text-primary hover:underline mt-4 inline-block"
                >
                    Quản lý địa chỉ
                </Link>
            </div>
        )
    }

    if (cartLoading || addressesLoading) {
        return <div className="container py-8">Đang tải...</div>
    }

    if (!cart) {
        return <></>;
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <AddressSelector
                        addresses={addresses}
                        selectedAddressId={state.selectedAddressId}
                        onSelectAddress={(id) => updateState({ selectedAddressId: id })}
                    />

                    <PaymentMethodSelector
                        selectedPayment={state.selectedPayment}
                        onSelectPayment={(method) => updateState({ selectedPayment: method })}
                    />

                    <OrderSummary cart={cart} />
                </div>

                <div>
                    <CheckoutActions
                        total={cart.totalInt}
                        isSubmitting={state.isSubmitting}
                        isDisabled={!state.selectedAddressId}
                        onCheckout={() => {
                            void handleCheckout()
                        }}
                    />
                </div>
            </div>

            <PaymentWaitingDialog
                open={paymentDialog.isOpen}
                onOpenChange={(open) =>
                    setPaymentDialog((prev) => ({ ...prev, isOpen: open }))
                }
                orderId={paymentDialog.orderId}
                payment={{
                    paymentId: paymentDialog.paymentId,
                    status: PaymentStatus.UNPAID,
                    qrCode: paymentDialog.qrCodeUrl,
                }}
                amountInt={cart.totalInt}
                onSuccess={(payment) => {
                    void handlePaymentSuccess(payment)
                }}
                onTimeout={handlePaymentTimeout}
                onError={handlePaymentError}
            />
        </div>
    )
}
