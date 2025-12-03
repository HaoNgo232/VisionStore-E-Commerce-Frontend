import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ProductForm } from "./product-form";
import type { Category } from "@/types";
import type { ProductFormValues } from "@/features/products/schemas/product-form.schema";

describe("ProductForm - tryOnImage field", () => {
    const categories: Category[] = [];

    it("calls onSubmit with tryOnImage file when selected", async () => {
        const handleSubmit = jest.fn((_: ProductFormValues) => Promise.resolve());

        const { container } = render(
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

        // Set required image field first (for create mode)
        const imageFile = new File(["image-data"], "product.jpg", { type: "image/jpeg" });
        const allFileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
        // First input is for product image (accepts jpeg/png/webp)
        const imageInput = allFileInputs[0];
        if (imageInput) {
            fireEvent.change(imageInput, { target: { files: [imageFile] } });
        }

        const file = new File(["data"], "glasses.png", { type: "image/png" });
        // Second input is for tryOnImage (accepts only png)
        const tryOnInput = allFileInputs[1] ?? container.querySelector<HTMLInputElement>('input[type="file"][accept="image/png"]');
        if (!tryOnInput) {
            throw new Error("tryOnImage input not found");
        }
        fireEvent.change(tryOnInput, { target: { files: [file] } });

        const submitButton = screen.getByRole("button", { name: /Tạo sản phẩm/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });
        const [[submittedData]] = handleSubmit.mock
            .calls as [[ProductFormValues]];
        expect(submittedData.tryOnImage).toBe(file);
    });
});


