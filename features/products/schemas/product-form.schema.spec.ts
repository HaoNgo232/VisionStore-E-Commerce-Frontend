import { ZodError } from "zod";
import { productFormSchema } from "./product-form.schema";

function createFile(type: string, sizeBytes: number): File {
  const blob = new Blob(["x".repeat(sizeBytes)], { type });
  return new File([blob], "test-file", { type });
}

describe("productFormSchema - tryOnImage validation", () => {
  it("accepts valid PNG try-on image under 20MB", () => {
    const file = createFile("image/png", 10 * 1024 * 1024); // 10MB

    const result = productFormSchema.parse({
      name: "Test Product",
      priceInt: 1000,
      description: null,
      categoryId: null,
      image: null,
      tryOnImage: file,
      sku: null,
      slug: null,
      stock: null,
      model3dUrl: null,
    });

    expect(result.tryOnImage).toBe(file);
  });

  it("rejects non-PNG try-on image", () => {
    const file = createFile("image/jpeg", 1024);

    try {
      productFormSchema.parse({
        name: "Test Product",
        priceInt: 1000,
        description: null,
        categoryId: null,
        image: null,
        tryOnImage: file,
        sku: null,
        slug: null,
        stock: null,
        model3dUrl: null,
      });
      // Nếu không ném lỗi, test phải fail
      fail("Expected ZodError to be thrown for non-PNG try-on image");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });

  it("rejects PNG try-on image larger than 20MB", () => {
    const file = createFile("image/png", 21 * 1024 * 1024);

    try {
      productFormSchema.parse({
        name: "Test Product",
        priceInt: 1000,
        description: null,
        categoryId: null,
        image: null,
        tryOnImage: file,
        sku: null,
        slug: null,
        stock: null,
        model3dUrl: null,
      });
      fail("Expected ZodError to be thrown for oversize PNG try-on image");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
});
