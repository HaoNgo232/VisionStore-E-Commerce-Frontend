import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import NewProductPage from "./page";
import { useCreateProduct } from "@/features/products/hooks/use-admin-products";
import type { AdminCreateProductRequest } from "@/types/product.types";

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    useParams: () => ({}),
}));

jest.mock("@/features/products/hooks/use-admin-products");
jest.mock("@/features/categories/hooks/use-categories", () => ({
    useCategories: () => ({
        categories: [],
    }),
}));

describe("NewProductPage integration - tryOnImage", () => {
    it("maps data.tryOnImage to AdminCreateProductRequest.tryOnImage", async () => {
        const mutateAsyncMock = jest.fn<Promise<void>, [AdminCreateProductRequest]>().mockResolvedValue(
            undefined,
        );

        (useCreateProduct as jest.Mock).mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });

        const { container } = render(<NewProductPage />);

        const nameInput = screen.getByLabelText("Tên sản phẩm *");
        const priceInput = screen.getByLabelText("Giá sản phẩm (VND) *");
        fireEvent.change(nameInput, { target: { value: "Test Product" } });
        fireEvent.change(priceInput, { target: { value: "1000" } });

        // Set required image field first (for create mode)
        const imageFile = new File(["image-data"], "product.jpg", { type: "image/jpeg" });
        const allFileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
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
            expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
        });
        const [[requestArg]] = mutateAsyncMock.mock
            .calls as [[AdminCreateProductRequest]];
        expect(requestArg.tryOnImage).toBe(file);
    });
});

