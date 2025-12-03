import { paymentsApi } from "./payments.service";
import { PaymentMethod, PaymentStatus } from "@/types";

// Mock dependencies
const mockApiPostValidated = jest.fn<Promise<unknown>, unknown[]>();
const mockApiGetValidated = jest.fn<Promise<unknown>, unknown[]>();

jest.mock("@/lib/api-client", () => ({
  apiPostValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiPostValidated(...args),
  apiGetValidated: (...args: unknown[]): Promise<unknown> =>
    mockApiGetValidated(...args),
}));

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

      mockApiPostValidated.mockResolvedValue(mockResponse);

      const result = await paymentsApi.process(
        mockOrderId,
        PaymentMethod.COD,
        199900,
      );

      expect(mockApiPostValidated).toHaveBeenCalledWith(
        "/payments/process",
        expect.anything(), // schema
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

      mockApiPostValidated.mockResolvedValue(mockResponse);

      const result = await paymentsApi.process(
        mockOrderId,
        PaymentMethod.SEPAY,
        199900,
      );

      expect(mockApiPostValidated).toHaveBeenCalledWith(
        "/payments/process",
        expect.anything(), // schema
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
      mockApiGetValidated.mockResolvedValue(mockPayment);

      const result = await paymentsApi.getByOrder(mockOrderId);

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        `/payments/order/${mockOrderId}`,
        expect.anything(), // schema
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe("getById", () => {
    it("gets payment by payment ID", async () => {
      mockApiGetValidated.mockResolvedValue(mockPayment);

      const result = await paymentsApi.getById(mockPaymentId);

      expect(mockApiGetValidated).toHaveBeenCalledWith(
        `/payments/${mockPaymentId}`,
        expect.anything(), // schema
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

      mockApiPostValidated.mockResolvedValue(paidPayment);

      const result = await paymentsApi.confirmCod(mockOrderId);

      expect(mockApiPostValidated).toHaveBeenCalledWith(
        `/payments/confirm-cod/${mockOrderId}`,
        expect.anything(), // schema
        {},
      );
      expect(result.status).toBe(PaymentStatus.PAID);
    });
  });
});
