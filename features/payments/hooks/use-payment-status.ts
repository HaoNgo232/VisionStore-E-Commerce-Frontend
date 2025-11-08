import { useEffect, useState, useCallback } from "react";
import { paymentsApi } from "@/features/payments/services/payments.service";
import { getErrorMessage } from "@/lib/api-client";
import { PaymentStatus } from "@/types";
import type { Payment } from "@/types";

interface UsePaymentStatusOptions {
  orderId: string;
  autoStart?: boolean;
  pollInterval?: number;
  maxAttempts?: number;
}

interface UsePaymentStatusResult {
  payment: Payment | null;
  status: PaymentStatus | null;
  loading: boolean;
  error: string | null;
  isPaid: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

/**
 * Hook to poll payment status for an order
 * Useful for checking when SePay payment is completed
 *
 * @param options - Configuration options
 * @returns Payment status and polling controls
 *
 * @example
 * ```typescript
 * const { payment, isPaid, loading } = usePaymentStatus({
 *   orderId: "order_123",
 *   autoStart: true,
 *   pollInterval: 5000, // 5 giây
 *   maxAttempts: 180 // 15 phút (5s * 180 = 900s)
 * });
 *
 * if (isPaid) {
 *   // Redirect to order confirmation
 * }
 * ```
 */
export function usePaymentStatus(
  options: UsePaymentStatusOptions,
): UsePaymentStatusResult {
  const {
    orderId,
    autoStart = false,
    pollInterval = 5000, // 5 seconds - tránh spam API
    maxAttempts = 180, // 15 minutes max (5s * 180 = 900s = 15min)
  } = options;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const isPaid = payment?.status === PaymentStatus.PAID;

  const checkPaymentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedPayment = await paymentsApi.getByOrder(orderId);
      setPayment(fetchedPayment);

      // Stop polling if payment is paid
      if (fetchedPayment.status === PaymentStatus.PAID) {
        setIsPolling(false);
        return true; // Payment completed
      }

      return false; // Still waiting
    } catch (err) {
      // console.error("Error checking payment status:", err);
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const startPolling = useCallback(() => {
    if (isPolling) {return;}

    setIsPolling(true);
    let _attempts = 0;

    const interval = setInterval(async () => {
      const isDone = await checkPaymentStatus();

      _attempts++;

      // Stop polling after max attempts
      if (_attempts >= maxAttempts) {
        clearInterval(interval);
        setIsPolling(false);
        if (!isDone) {
          setError("Quá thời gian chờ. Vui lòng kiểm tra trạng thái đơn hàng.");
        }
        return;
      }

      if (isDone) {
        clearInterval(interval);
        setIsPolling(false);
      }
    }, pollInterval);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [checkPaymentStatus, isPolling, maxAttempts, pollInterval]);

  // Auto-start polling if requested
  useEffect(() => {
    if (autoStart && !isPolling) {
      void startPolling();
    }
  }, [autoStart, isPolling, startPolling]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    payment,
    status: payment?.status ?? null,
    loading: loading || isPolling,
    error,
    isPaid,
    startPolling,
    stopPolling,
  };
}
