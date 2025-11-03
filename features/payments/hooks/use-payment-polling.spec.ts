import { renderHook, act, waitFor } from "@testing-library/react";
import { usePaymentPolling } from "./use-payment-polling";
import { paymentsApi } from "../services/payments.service";
import { PaymentStatus } from "@/types";

// Mock the payments API
jest.mock("../services/payments.service", () => ({
  paymentsApi: {
    getByOrder: jest.fn(),
  },
}));

const mockPaymentsApi = paymentsApi as jest.Mocked<typeof paymentsApi>;

// Mock timers
jest.useFakeTimers();

describe("usePaymentPolling", () => {
  const mockOrderId = "order-123";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe("Initial state", () => {
    it("starts with correct initial state", () => {
      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: false }),
      );

      expect(result.current.isPolling).toBe(false);
      expect(result.current.attempts).toBe(0);
      expect(result.current.error).toBe(null);
    });
  });

  describe("Polling behavior", () => {
    it("starts polling when enabled", async () => {
      mockPaymentsApi.getByOrder.mockResolvedValue({
        id: "payment-123",
        orderId: mockOrderId,
        status: PaymentStatus.UNPAID,
        method: "COD" as any,
        amountInt: 100000,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true }),
      );

      // Should start polling immediately
      expect(result.current.isPolling).toBe(true);

      // Fast-forward time to trigger polling
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockPaymentsApi.getByOrder).toHaveBeenCalledWith(mockOrderId);
    });

    it("stops polling when payment is PAID", async () => {
      mockPaymentsApi.getByOrder.mockResolvedValue({
        id: "payment-123",
        orderId: mockOrderId,
        status: PaymentStatus.PAID,
        method: "COD" as any,
        amountInt: 100000,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true, onSuccess }),
      );

      // Wait for the initial check
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      expect(result.current.isPolling).toBe(false);
    });

    it("calls onSuccess when payment becomes PAID", async () => {
      const onSuccess = jest.fn();

      // First call returns UNPAID
      mockPaymentsApi.getByOrder
        .mockResolvedValueOnce({
          id: "payment-123",
          orderId: mockOrderId,
          status: PaymentStatus.UNPAID,
          method: "COD" as any,
          amountInt: 100000,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        })
        // Second call returns PAID
        .mockResolvedValueOnce({
          id: "payment-123",
          orderId: mockOrderId,
          status: PaymentStatus.PAID,
          method: "COD" as any,
          amountInt: 100000,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });

      renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true, onSuccess }),
      );

      // Wait for first poll
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for second poll
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.PAID }),
      );
    });

    it("calls onTimeout after max attempts", async () => {
      mockPaymentsApi.getByOrder.mockResolvedValue({
        id: "payment-123",
        orderId: mockOrderId,
        status: PaymentStatus.UNPAID,
        method: "COD" as any,
        amountInt: 100000,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      const onTimeout = jest.fn();

      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true, onTimeout }),
      );

      // Fast-forward to max attempts (180 * 5000ms = 900000ms)
      await act(async () => {
        jest.advanceTimersByTime(900000);
      });

      expect(onTimeout).toHaveBeenCalled();
      expect(result.current.isPolling).toBe(false);
      expect(result.current.attempts).toBe(181);
    });

    it("retries on network error up to 3 times", async () => {
      const onError = jest.fn();

      // Mock network error for first 3 calls, then success on 4th call
      mockPaymentsApi.getByOrder
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          id: "payment-123",
          orderId: mockOrderId,
          status: PaymentStatus.UNPAID,
          method: "COD" as any,
          amountInt: 100000,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });

      renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true, onError })
      );

      // Wait for one polling cycle to complete
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Should have called API at least 4 times (3 retries + 1 success)
      expect(mockPaymentsApi.getByOrder).toHaveBeenCalledTimes(5); // initial + 3 retries + 1 from interval
      expect(onError).not.toHaveBeenCalled(); // Should continue polling after retries
    });

    it("calls onError after max retries", async () => {
      const onError = jest.fn();

      // Mock persistent network error (4 failures = initial + 3 retries)
      mockPaymentsApi.getByOrder.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true, onError })
      );

      // Wait for one polling cycle to complete
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      expect(onError).toHaveBeenCalledWith("Network error");
      expect(result.current.isPolling).toBe(false);
      expect(result.current.error).toBe("Network error");
    });
  });

  describe("Manual control", () => {
    it("allows manual stopping of polling", async () => {
      mockPaymentsApi.getByOrder.mockResolvedValue({
        id: "payment-123",
        orderId: mockOrderId,
        status: PaymentStatus.UNPAID,
        method: "COD" as any,
        amountInt: 100000,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true }),
      );

      expect(result.current.isPolling).toBe(true);

      act(() => {
        result.current.stopPolling();
      });

      expect(result.current.isPolling).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("cleans up interval on unmount", () => {
      mockPaymentsApi.getByOrder.mockResolvedValue({
        id: "payment-123",
        orderId: mockOrderId,
        status: PaymentStatus.UNPAID,
        method: "COD" as any,
        amountInt: 100000,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      const { unmount } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: true }),
      );

      expect(mockPaymentsApi.getByOrder).toHaveBeenCalledTimes(1);

      unmount();

      // Fast-forward time - should not call API again
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockPaymentsApi.getByOrder).toHaveBeenCalledTimes(1);
    });

    it("does not start polling when disabled", () => {
      const { result } = renderHook(() =>
        usePaymentPolling({ orderId: mockOrderId, enabled: false }),
      );

      expect(result.current.isPolling).toBe(false);
      expect(mockPaymentsApi.getByOrder).not.toHaveBeenCalled();
    });
  });
});
