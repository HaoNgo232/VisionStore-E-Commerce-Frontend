import { render, fireEvent, screen } from "@testing-library/react";
import EditProductPage from "./page";
import {
    useAdminProduct,
    useUpdateProduct,
} from "@/features/products/hooks/use-admin-products";
import type { AdminUpdateProductRequest } from "@/types/product.types";

const mockProduct = {
    id: "prod-1",
    name: "Existing Product",
    priceInt: 1000,
    description: null,
    categoryId: null,
    imageUrls: [],
    sku: "SKU-1",
    slug: "existing-product",
    stock: 5,
    model3dUrl: null,
    attributes: null,
};

const mutateAsyncMock = jest
    .fn<Promise<void>, [{ id: string; data: AdminUpdateProductRequest }]>()
    .mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    useParams: () => ({ id: "prod-1" }),
}));

jest.mock("@/features/products/hooks/use-admin-products");

jest.mock("@/features/categories/hooks/use-categories", () => ({
    useCategories: () => ({
        categories: [],
    }),
}));

describe("EditProductPage integration - tryOnImage", () => {
    it("maps data.tryOnImage to AdminUpdateProductRequest.tryOnImage", () => {
        (useAdminProduct as jest.Mock).mockReturnValue({
            data: mockProduct,
            isLoading: false,
        });

        (useUpdateProduct as jest.Mock).mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });

        render(<EditProductPage />);

        const nameInput = screen.getByLabelText("Tên sản phẩm *");
        const priceInput = screen.getByLabelText("Giá sản phẩm (VND) *");
        fireEvent.change(nameInput, { target: { value: "Updated Product" } });
        fireEvent.change(priceInput, { target: { value: "2000" } });

        const file = new File(["data"], "glasses.png", { type: "image/png" });
        const tryOnInput = screen.getByLabelText("Ảnh thử kính (PNG, nền trong suốt)");
        fireEvent.change(tryOnInput, { target: { files: [file] } });

        const submitButton = screen.getByRole("button", {
            name: /Cập nhật sản phẩm/i,
        });
        fireEvent.click(submitButton);

        expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
        const [[payloadArg]] = mutateAsyncMock.mock
            .calls as [[{ id: string; data: AdminUpdateProductRequest }]];
        expect(payloadArg.data.tryOnImage).toBe(file);
    });
});


