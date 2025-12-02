import { render, fireEvent, screen } from "@testing-library/react";
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
    it("maps data.tryOnImage to AdminCreateProductRequest.tryOnImage", () => {
        const mutateAsyncMock = jest.fn<Promise<void>, [AdminCreateProductRequest]>().mockResolvedValue(
            undefined,
        );

        (useCreateProduct as jest.Mock).mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });

        render(<NewProductPage />);

        const nameInput = screen.getByLabelText("Tên sản phẩm *");
        const priceInput = screen.getByLabelText("Giá sản phẩm (VND) *");
        fireEvent.change(nameInput, { target: { value: "Test Product" } });
        fireEvent.change(priceInput, { target: { value: "1000" } });

        const file = new File(["data"], "glasses.png", { type: "image/png" });
        const tryOnInput = screen.getByLabelText("Ảnh thử kính (PNG, nền trong suốt)");
        fireEvent.change(tryOnInput, { target: { files: [file] } });

        const submitButton = screen.getByRole("button", { name: /Tạo sản phẩm/i });
        fireEvent.click(submitButton);

        expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
        const [[requestArg]] = mutateAsyncMock.mock
            .calls as [[AdminCreateProductRequest]];
        expect(requestArg.tryOnImage).toBe(file);
    });
});

