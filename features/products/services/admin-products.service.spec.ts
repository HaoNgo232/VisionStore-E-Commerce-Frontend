import { AdminProductsService } from "./admin-products.service";
import type {
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
} from "@/types/product.types";

function getFormDataEntries(formData: FormData): Record<string, unknown> {
  const entries: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    entries[key] = value;
  });
  return entries;
}

describe("AdminProductsService FormData builders", () => {
  const service = new AdminProductsService();
  const typedService = service as unknown as {
    buildCreateFormData: (request: AdminCreateProductRequest) => FormData;
    buildUpdateFormData: (request: AdminUpdateProductRequest) => FormData;
  };

  it("buildCreateFormData appends tryOnImage when provided", () => {
    const file = new File(["data"], "glasses.png", { type: "image/png" });

    const formData = typedService.buildCreateFormData({
      name: "Product",
      priceInt: 1000,
      tryOnImage: file,
    });

    const entries = getFormDataEntries(formData) as { tryOnImage?: File };
    expect(entries.tryOnImage).toBe(file);
  });

  it("buildUpdateFormData appends tryOnImage only when provided", () => {
    const file = new File(["data"], "glasses.png", { type: "image/png" });

    const formDataWithFile = typedService.buildUpdateFormData({
      tryOnImage: file,
    });
    const entriesWithFile = getFormDataEntries(formDataWithFile) as {
      tryOnImage?: File;
    };
    expect(entriesWithFile.tryOnImage).toBe(file);

    const formDataWithoutFile = typedService.buildUpdateFormData({});
    const entriesWithoutFile = getFormDataEntries(formDataWithoutFile) as {
      tryOnImage?: File;
    };
    expect(entriesWithoutFile.tryOnImage).toBeUndefined();
  });
});
