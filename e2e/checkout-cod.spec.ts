import { test, expect } from "@playwright/test";

test.describe("Checkout - COD Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home
    await page.goto("/");

    // Login if needed (assuming already logged in via session)
    // Or mock auth via API
    const loginUrl = page.url();
    if (loginUrl.includes("login")) {
      await page.goto("/");
    }
  });

  test("COD: Complete checkout and redirect to success page", async ({
    page,
  }) => {
    // Step 1: Add product to cart
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Add to cart
    const addToCartBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addToCartBtn.click();

    // Verify toast notification
    await expect(page.locator("text=Thêm vào giỏ hàng thành công")).toBeVisible(
      { timeout: 5000 },
    );

    // Step 2: Go to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Verify cart has items
    const cartItems = page.locator('[data-testid="cart-item"]');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Step 3: Checkout
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    await page.waitForURL("/cart/checkout", { timeout: 5000 });

    // Step 4: Select COD (default)
    const codOption = page.locator('input[value="COD"]');
    await codOption.check();

    // Step 5: Select address (if multiple)
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();

    // Step 6: Submit order
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Step 7: Verify redirect to success page
    await page.waitForURL(/\/cart\/success\?orderId=.*&paymentMethod=COD/, {
      timeout: 10000,
    });

    // Step 8: Verify success page content
    await expect(page.locator("text=Đơn hàng đã đặt thành công")).toBeVisible();

    // Verify order status badges
    await expect(
      page.locator('[data-testid="order-status-badge"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="payment-status-badge"]'),
    ).toBeVisible();

    // Verify COD confirmation message
    await expect(page.locator("text=Thanh toán khi nhận hàng")).toBeVisible();

    // Verify order ID displayed
    const orderIdMatch = page.url().match(/orderId=([^&]+)/);
    expect(orderIdMatch).toBeTruthy();
    const orderId = orderIdMatch![1];

    await expect(page.locator(`text=${orderId}`)).toBeVisible();
  });

  test("COD: Cart is cleared after successful order", async ({ page }) => {
    // Navigate to cart (with items from previous test or setup)
    await page.goto("/cart");

    // Verify cart has items
    const cartItemsInitial = page.locator('[data-testid="cart-item"]');
    const initialCount = await cartItemsInitial.count();

    if (initialCount === 0) {
      // Add item if cart empty
      await page.goto("/products");
      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await firstProduct.click();
      const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
      await addBtn.click();
      await page.goto("/cart");
    }

    // Proceed to checkout
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    await page.waitForURL("/cart/checkout", { timeout: 5000 });

    // Select COD
    const codOption = page.locator('input[value="COD"]');
    await codOption.check();

    // Select address
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();

    // Submit order
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Wait for success page
    await page.waitForURL(/\/cart\/success/, { timeout: 10000 });

    // Go back to cart
    await page.goto("/cart");

    // Verify cart is empty
    const cartEmpty = page.locator("text=Giỏ hàng trống");
    await expect(cartEmpty).toBeVisible({ timeout: 5000 });
  });

  test("COD: View order detail from success page", async ({ page }) => {
    // Complete COD checkout (reuse previous flow)
    await page.goto("/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    await page.waitForURL("/cart/checkout", { timeout: 5000 });

    const codOption = page.locator('input[value="COD"]');
    await codOption.check();
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Wait for success page
    await page.waitForURL(/\/cart\/success/, { timeout: 10000 });

    // Click "Xem chi tiết đơn hàng"
    const viewOrderBtn = page.locator(
      'button:has-text("Xem chi tiết đơn hàng")',
    );
    await viewOrderBtn.click();

    // Verify redirect to order detail page
    await page.waitForURL(/\/orders\/[a-z0-9-]+/, { timeout: 5000 });

    // Verify order detail page content
    await expect(page.locator("text=Chi tiết đơn hàng")).toBeVisible();
    await expect(
      page.locator('[data-testid="order-status-badge"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="payment-status-badge"]'),
    ).toBeVisible();
  });
});
