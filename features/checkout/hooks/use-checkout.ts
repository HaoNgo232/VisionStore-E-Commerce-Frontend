/**
 * useCheckout Hook
 * Centralizes checkout state management and business logic
 * Handles checkout flow, payment processing, and navigation
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaymentMethod, type Cart, type Payment } from "@/types";
import { checkoutService } from "../services/checkout.service";
import type { CheckoutState } from "../types/checkout.types";

/**
 * Payment dialog state
 */
interface PaymentDialogState {
  isOpen: boolean;
  orderId: string;
  paymentId: string;
  qrCodeUrl: string;
}

/**
 * useCheckout hook return type
 */
export interface UseCheckoutReturn {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  paymentDialog: PaymentDialogState;
  setPaymentDialog: React.Dispatch<React.SetStateAction<PaymentDialogState>>;
  handleCheckout: () => Promise<void>;
  handlePaymentSuccess: (payment: Payment) => Promise<void>;
  handlePaymentTimeout: () => void;
  handlePaymentError: (error: string) => void;
}

/**
 * Custom hook for checkout flow management
 * @param cart - Shopping cart
 * @param clearCart - Function to clear cart after successful checkout
 * @returns Checkout state and handlers
 */
export function useCheckout(
  cart: Cart | null,
  clearCart: () => Promise<void>,
): UseCheckoutReturn {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState>({
    selectedAddressId: "",
    selectedPayment: PaymentMethod.COD,
    isSubmitting: false,
  });

  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>({
    isOpen: false,
    orderId: "",
    paymentId: "",
    qrCodeUrl: "",
  });

  const updateState = (updates: Partial<CheckoutState>): void => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleCheckout = async (): Promise<void> => {
    // Validation
    const validation = checkoutService.validateCheckoutRequest(
      cart,
      state.selectedAddressId,
    );

    if (!validation.isValid) {
      for (const error of validation.errors) {
        toast.error(error);
      }
      return;
    }

    if (!cart) {
      return;
    }

    updateState({ isSubmitting: true });

    try {
      if (state.selectedPayment === PaymentMethod.COD) {
        // COD flow: Show success toast and redirect to success page
        const { orderId } = await checkoutService.processCodCheckout(
          state.selectedAddressId,
          cart,
        );
        toast.success("Đặt hàng thành công!");
        await clearCart();
        router.push(
          `/cart/success?orderId=${orderId}&paymentMethod=${state.selectedPayment}`,
        );
      } else if (state.selectedPayment === PaymentMethod.SEPAY) {
        // SePay flow: Process payment to get QR, then open waiting dialog
        const { orderId, paymentId, qrCode } =
          await checkoutService.processSepayCheckout(
            state.selectedAddressId,
            cart,
          );
        setPaymentDialog({
          isOpen: true,
          orderId,
          paymentId,
          qrCodeUrl: qrCode,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đặt hàng thất bại";
      toast.error(message);
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  const handlePaymentSuccess = async (payment: Payment): Promise<void> => {
    setPaymentDialog((prev) => ({ ...prev, isOpen: false }));

    // Show success toast immediately when payment detected
    toast.success("🎉 Thanh toán thành công!", {
      description: `Đơn hàng ${payment.orderId} đã được thanh toán`,
      duration: 5000,
    });

    // Clear cart after successful payment
    try {
      await clearCart();
    } catch {
      // Swallow non-critical cart clear errors
    }

    // Redirect to success page (consistent with COD flow)
    router.push(
      `/cart/success?orderId=${payment.orderId}&paymentMethod=${PaymentMethod.SEPAY}`,
    );
  };

  const handlePaymentTimeout = (): void => {
    setPaymentDialog((prev) => ({ ...prev, isOpen: false }));
    toast.error("Thanh toán hết thời gian. Vui lòng thử lại.");
  };

  const handlePaymentError = (error: string): void => {
    setPaymentDialog((prev) => ({ ...prev, isOpen: false }));
    toast.error(error);
  };

  return {
    state,
    updateState,
    paymentDialog,
    setPaymentDialog,
    handleCheckout,
    handlePaymentSuccess,
    handlePaymentTimeout,
    handlePaymentError,
  };
}
