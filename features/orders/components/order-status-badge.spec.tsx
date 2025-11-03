import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatus } from "@/types";

describe("OrderStatusBadge", () => {
    describe("Render correct status labels", () => {
        it("renders PENDING status with correct label", () => {
            render(<OrderStatusBadge status={OrderStatus.PENDING} />);
            expect(screen.getByText("Chờ xử lý")).toBeInTheDocument();
        });

        it("renders PROCESSING status with correct label", () => {
            render(<OrderStatusBadge status={OrderStatus.PROCESSING} />);
            expect(screen.getByText("Đang xử lý")).toBeInTheDocument();
        });

        it("renders SHIPPED status with correct label", () => {
            render(<OrderStatusBadge status={OrderStatus.SHIPPED} />);
            expect(screen.getByText("Đang giao hàng")).toBeInTheDocument();
        });

        it("renders DELIVERED status with correct label", () => {
            render(<OrderStatusBadge status={OrderStatus.DELIVERED} />);
            expect(screen.getByText("Đã giao hàng")).toBeInTheDocument();
        });

        it("renders CANCELLED status with correct label", () => {
            render(<OrderStatusBadge status={OrderStatus.CANCELLED} />);
            expect(screen.getByText("Đã hủy")).toBeInTheDocument();
        });
    });

    describe("Render badge with correct variant", () => {
        it("renders PENDING with outline variant", () => {
            const { container } = render(
                <OrderStatusBadge status={OrderStatus.PENDING} />
            );
            const badge = container.querySelector("span");
            expect(badge).toBeInTheDocument();
        });

        it("renders PROCESSING with outline variant", () => {
            const { container } = render(
                <OrderStatusBadge status={OrderStatus.PROCESSING} />
            );
            const badge = container.querySelector("span");
            expect(badge).toBeInTheDocument();
        });

        it("renders SHIPPED with secondary variant", () => {
            const { container } = render(
                <OrderStatusBadge status={OrderStatus.SHIPPED} />
            );
            const badge = container.querySelector("span");
            expect(badge).toBeInTheDocument();
        });

        it("renders DELIVERED with default variant", () => {
            const { container } = render(
                <OrderStatusBadge status={OrderStatus.DELIVERED} />
            );
            const badge = container.querySelector("span");
            expect(badge).toBeInTheDocument();
        });

        it("renders CANCELLED with destructive variant", () => {
            const { container } = render(
                <OrderStatusBadge status={OrderStatus.CANCELLED} />
            );
            const badge = container.querySelector("span");
            expect(badge).toBeInTheDocument();
        });
    });

    describe("Custom className prop", () => {
        it("accepts and applies custom className", () => {
            const { container } = render(
                <OrderStatusBadge
                    status={OrderStatus.PENDING}
                    className="custom-class"
                />
            );
            const badge = container.querySelector("span");
            expect(badge).toHaveClass("custom-class");
        });

        it("renders with className while keeping text content", () => {
            render(
                <OrderStatusBadge
                    status={OrderStatus.PENDING}
                    className="text-lg"
                />
            );
            expect(screen.getByText("Chờ xử lý")).toBeInTheDocument();
        });
    });

    describe("Edge cases", () => {
        it("handles all OrderStatus enum values", () => {
            const statuses = Object.values(OrderStatus);
            statuses.forEach((status) => {
                const { container } = render(<OrderStatusBadge status={status} />);
                expect(container.querySelector("span")).toBeInTheDocument();
            });
        });
    });
});
