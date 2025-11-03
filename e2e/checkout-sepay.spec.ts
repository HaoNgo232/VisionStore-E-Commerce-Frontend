import { test, expect } from "@playwright/test";

test.describe("Checkout - SePay Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure logged in
  });

  test("SePay: Open waiting dialog after order creation", async ({ page }) => {
    // Step 1: Add product to cart
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    const addToCartBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addToCartBtn.click();

    // Step 2: Go to checkout
    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    await page.waitForURL("/cart/checkout", { timeout: 5000 });

    // Step 3: Select SePay
    const sepayOption = page.locator('input[value="SEPAY"]');
    await sepayOption.check();

    // Step 4: Select address
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();

    // Step 5: Submit order
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Step 6: Verify waiting dialog appears
    const waitingDialog = page.locator(
      '[data-testid="payment-waiting-dialog"]',
    );
    await expect(waitingDialog).toBeVisible({ timeout: 5000 });

    // Step 7: Verify QR code displayed
    const qrCode = page.locator('[data-testid="qr-code"]');
    await expect(qrCode).toBeVisible();

    // Step 8: Verify countdown timer
    const countdownTimer = page.locator('[data-testid="countdown-timer"]');
    await expect(countdownTimer).toBeVisible();
  });

  test("SePay: Show success dialog when payment confirmed", async ({
    page,
  }) => {
    // Complete SePay order (abbreviated - reuse setup)
    await page.goto("/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    await page.waitForURL("/cart/checkout", { timeout: 5000 });

    const sepayOption = page.locator('input[value="SEPAY"]');
    await sepayOption.check();
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Verify waiting dialog
    await expect(
      page.locator('[data-testid="payment-waiting-dialog"]'),
    ).toBeVisible({ timeout: 5000 });

    // Mock webhook: Mark payment as PAID
    // In real scenario, this would be triggered by backend webhook
    // For E2E, we can simulate by:
    // 1. API call to mark payment as PAID
    // 2. Or poll until payment detected as paid

    // Simulate payment success by mocking API response
    await page.route("**/api/payments/**/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "payment-123",
          status: "PAID",
          paymentMethod: "SEPAY",
        }),
      });
    });

    // Wait for success dialog to appear (after polling detects paid status)
    const successDialog = page.locator(
      '[data-testid="payment-success-dialog"]',
    );
    await expect(successDialog).toBeVisible({ timeout: 10000 });

    // Verify success message
    await expect(page.locator("text=Thanh toán thành công")).toBeVisible();

    // Verify countdown timer in success dialog
    const countdownText = page.locator(
      "text=/Chuyển đến trang chi tiết đơn hàng sau.*s/",
    );
    await expect(countdownText).toBeVisible();
  });

  test("SePay: Auto-redirect after success confirmation", async ({ page }) => {
    // Setup and complete SePay order
    await page.goto("/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    const sepayOption = page.locator('input[value="SEPAY"]');
    await sepayOption.check();
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Mock payment as PAID
    await page.route("**/api/payments/**/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "payment-123",
          status: "PAID",
        }),
      });
    });

    // Wait for success dialog
    await expect(
      page.locator('[data-testid="payment-success-dialog"]'),
    ).toBeVisible({ timeout: 10000 });

    // Wait for auto-redirect (should happen after 3 seconds)
    await page.waitForURL(/\/orders\/[a-z0-9-]+/, { timeout: 6000 });

    // Verify order detail page
    await expect(page.locator("text=Chi tiết đơn hàng")).toBeVisible();
  });

  test('SePay: Manual redirect via "Xem chi tiết" button', async ({ page }) => {
    // Setup and complete SePay order
    await page.goto("/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    const sepayOption = page.locator('input[value="SEPAY"]');
    await sepayOption.check();
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Mock payment as PAID
    await page.route("**/api/payments/**/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "payment-123",
          status: "PAID",
        }),
      });
    });

    // Wait for success dialog
    await expect(
      page.locator('[data-testid="payment-success-dialog"]'),
    ).toBeVisible({ timeout: 10000 });

    // Click "Xem chi tiết đơn hàng" button (manual redirect)
    const viewOrderBtn = page.locator(
      'button:has-text("Xem chi tiết đơn hàng")',
    );
    await viewOrderBtn.click();

    // Verify immediate redirect (should not wait for auto-redirect timer)
    await page.waitForURL(/\/orders\/[a-z0-9-]+/, { timeout: 2000 });

    // Verify order detail page
    await expect(page.locator("text=Chi tiết đơn hàng")).toBeVisible();
  });

  test("SePay: Cart cleared after successful payment", async ({ page }) => {
    // Complete SePay checkout
    await page.goto("/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    const addBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await addBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    await checkoutBtn.click();

    const sepayOption = page.locator('input[value="SEPAY"]');
    await sepayOption.check();
    const addressRadio = page.locator('[data-testid="address-option"]').first();
    await addressRadio.click();
    const submitBtn = page.locator('button:has-text("Đặt hàng")');
    await submitBtn.click();

    // Mock payment as PAID
    await page.route("**/api/payments/**/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "payment-123",
          status: "PAID",
        }),
      });
    });

    // Wait for success dialog and redirect
    await expect(
      page.locator('[data-testid="payment-success-dialog"]'),
    ).toBeVisible({ timeout: 10000 });
    await page.waitForURL(/\/orders\/[a-z0-9-]+/, { timeout: 6000 });

    // Go back to cart
    await page.goto("/cart");

    // Verify cart is empty
    await expect(page.locator("text=Giỏ hàng trống")).toBeVisible({
      timeout: 5000,
    });
  });
});
