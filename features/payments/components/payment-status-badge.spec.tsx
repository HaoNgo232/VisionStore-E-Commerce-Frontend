import { render, screen } from "@testing-library/react";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentStatus } from "@/types";

describe("PaymentStatusBadge", () => {
    describe("Render correct status labels", () => {
        it("renders UNPAID status with correct label", () => {
            render(<PaymentStatusBadge status={PaymentStatus.UNPAID} />);
            expect(screen.getByText("Chưa thanh toán")).toBeInTheDocument();
        });

        it("renders PAID status with correct label", () => {
            render(<PaymentStatusBadge status={PaymentStatus.PAID} />);
            expect(screen.getByText("Đã thanh toán")).toBeInTheDocument();
        });
    });

    describe("Render badge with correct variant", () => {
        it("renders UNPAID with outline variant", () => {
            render(<PaymentStatusBadge status={PaymentStatus.UNPAID} />);
            const badge = screen.getByText("Chưa thanh toán");
            expect(badge).toBeInTheDocument();
        });

        it("renders PAID with default variant", () => {
            render(<PaymentStatusBadge status={PaymentStatus.PAID} />);
            const badge = screen.getByText("Đã thanh toán");
            expect(badge).toBeInTheDocument();
        });
    });

    describe("Custom className prop", () => {
        it("accepts and applies custom className", () => {
            render(<PaymentStatusBadge status={PaymentStatus.UNPAID} className="custom-class" />);
            const badge = screen.getByText("Chưa thanh toán");
            expect(badge).toHaveClass("custom-class");
        });

        it("renders with className while keeping text content", () => {
            render(<PaymentStatusBadge status={PaymentStatus.PAID} className="test-class" />);
            const badge = screen.getByText("Đã thanh toán");
            expect(badge).toHaveClass("test-class");
            expect(badge).toBeInTheDocument();
        });
    });

    describe("Edge cases", () => {
        it("handles all PaymentStatus enum values", () => {
            const statuses = Object.values(PaymentStatus);

            statuses.forEach((status) => {
                render(<PaymentStatusBadge status={status} />);
                expect(screen.getByText(status === PaymentStatus.UNPAID ? "Chưa thanh toán" : "Đã thanh toán")).toBeInTheDocument();
            });
        });
    });
});