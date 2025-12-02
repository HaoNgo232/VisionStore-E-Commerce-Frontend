import { render, fireEvent, screen } from "@testing-library/react";
import { ProductForm } from "./product-form";
import type { Category } from "@/types";
import type { ProductFormValues } from "@/features/products/schemas/product-form.schema";

describe("ProductForm - tryOnImage field", () => {
    const categories: Category[] = [];

    it("calls onSubmit with tryOnImage file when selected", () => {
        const handleSubmit = jest.fn((_: ProductFormValues) => Promise.resolve());

        render(
            <ProductForm
                mode="create"
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={false}
            />,
        );

        const nameInput = screen.getByLabelText("Tên sản phẩm *");
        const priceInput = screen.getByLabelText("Giá sản phẩm (VND) *");
        fireEvent.change(nameInput, { target: { value: "Test Product" } });
        fireEvent.change(priceInput, { target: { value: "1000" } });

        const file = new File(["data"], "glasses.png", { type: "image/png" });
        const tryOnInput = screen.getByLabelText("Ảnh thử kính (PNG, nền trong suốt)");
        fireEvent.change(tryOnInput, { target: { files: [file] } });

        const submitButton = screen.getByRole("button", { name: /Tạo sản phẩm/i });
        fireEvent.click(submitButton);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
        const [[submittedData]] = handleSubmit.mock
            .calls as [[ProductFormValues]];
        expect(submittedData.tryOnImage).toBe(file);
    });
});


