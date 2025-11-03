import { paymentsApi } from "./payments.service";
import * as apiClient from "@/lib/api-client";
import { PaymentMethod, PaymentStatus } from "@/types";

// Mock dependencies
jest.mock("@/lib/api-client");

describe("paymentsApi", () => {
  const mockOrderId = "order-123";
  const mockPaymentId = "payment-123";
  const mockPayment = {
    id: mockPaymentId,
    orderId: mockOrderId,
    method: PaymentMethod.COD,
    status: PaymentStatus.UNPAID,
    amountInt: 199900,
    metadata: {},
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("process", () => {
    it("processes COD payment", async () => {
      const mockResponse = {
        id: mockPaymentId,
        orderId: mockOrderId,
        method: PaymentMethod.COD,
        status: PaymentStatus.UNPAID,
        amountInt: 199900,
      };

      (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await paymentsApi.process(
        mockOrderId,
        PaymentMethod.COD,
        199900,
      );

      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        "/payments/process",
        {
          orderId: mockOrderId,
          method: PaymentMethod.COD,
          amountInt: 199900,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("processes SePay payment", async () => {
      const mockResponse = {
        id: mockPaymentId,
        orderId: mockOrderId,
        method: PaymentMethod.SEPAY,
        status: PaymentStatus.UNPAID,
        amountInt: 199900,
        qrCode: "00020101021202031050...",
      };

      (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await paymentsApi.process(
        mockOrderId,
        PaymentMethod.SEPAY,
        199900,
      );

      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        "/payments/process",
        {
          orderId: mockOrderId,
          method: PaymentMethod.SEPAY,
          amountInt: 199900,
        },
      );
      expect(result.qrCode).toBeDefined();
    });
  });

  describe("getByOrder", () => {
    it("gets payment by order ID", async () => {
      (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPayment,
      });

      const result = await paymentsApi.getByOrder(mockOrderId);

      expect(apiClient.apiClient.get).toHaveBeenCalledWith(
        `/payments/order/${mockOrderId}`,
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe("getById", () => {
    it("gets payment by payment ID", async () => {
      (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPayment,
      });

      const result = await paymentsApi.getById(mockPaymentId);

      expect(apiClient.apiClient.get).toHaveBeenCalledWith(
        `/payments/${mockPaymentId}`,
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe("confirmCod", () => {
    it("confirms COD payment", async () => {
      const paidPayment = {
        ...mockPayment,
        status: PaymentStatus.PAID,
      };

      (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
        data: paidPayment,
      });

      const result = await paymentsApi.confirmCod(mockOrderId);

      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        `/payments/confirm-cod/${mockOrderId}`,
      );
      expect(result.status).toBe(PaymentStatus.PAID);
    });
  });
});
