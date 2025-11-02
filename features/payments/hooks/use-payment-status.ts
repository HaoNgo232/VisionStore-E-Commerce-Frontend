import { useEffect, useState, useCallback } from "react";
import { paymentsApi } from "@/features/payments/services/payments.service";
import { getErrorMessage } from "@/lib/api-client";
import type { Payment, PaymentStatus } from "@/types";

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
 *   pollInterval: 3000,
 *   maxAttempts: 40 // 2 minutes
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
    pollInterval = 3000, // 3 seconds
    maxAttempts = 300, // 15 minutes max
  } = options;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const isPaid = payment?.status === "PAID";

  const checkPaymentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedPayment = await paymentsApi.getByOrder(orderId);
      setPayment(fetchedPayment);

      // Stop polling if payment is paid
      if (fetchedPayment.status === "PAID") {
        setIsPolling(false);
        setAttempts(0);
        return true; // Payment completed
      }

      return false; // Still waiting
    } catch (err) {
      console.error("Error checking payment status:", err);
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Auto-start polling if requested
  useEffect(() => {
    if (autoStart && !isPolling) {
      startPolling();
    }
  }, [autoStart]); // Only run on mount

  const startPolling = useCallback(() => {
    if (isPolling) return;

    setIsPolling(true);
    setAttempts(0);

    const interval = setInterval(async () => {
      const isDone = await checkPaymentStatus();

      setAttempts((prev) => {
        const nextAttempt = prev + 1;

        // Stop polling after max attempts
        if (nextAttempt >= maxAttempts) {
          clearInterval(interval);
          setIsPolling(false);
          if (!isDone) {
            setError(
              "Quá thời gian chờ. Vui lòng kiểm tra trạng thái đơn hàng.",
            );
          }
          return maxAttempts;
        }

        return nextAttempt;
      });

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

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setAttempts(0);
  }, []);

  return {
    payment,
    status: payment?.status || null,
    loading: loading || isPolling,
    error,
    isPaid,
    startPolling,
    stopPolling,
  };
}
