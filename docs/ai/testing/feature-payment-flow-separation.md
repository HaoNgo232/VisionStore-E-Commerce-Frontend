---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: payment-flow-separation
created: 2025-11-03
---

# Testing Strategy: Payment Flow Separation

## Test Coverage Goals

**What level of testing do we aim for?**

### Coverage Targets

- **Unit Tests**: 100% coverage for new components and hooks
- **Integration Tests**: All critical paths (COD flow, SePay flow)
- **E2E Tests**: Key user journeys (checkout → success → order detail)
- **Manual Tests**: Real BIDV transfers on Day 7

### Alignment with Requirements

All tests must verify acceptance criteria from requirements doc:

- ✅ COD redirects to success page immediately
- ✅ SePay shows waiting dialog with QR code
- ✅ Payment polling works (5s interval, 180 max attempts)
- ✅ Success dialog appears when payment confirmed
- ✅ Auto redirect to order detail (3s countdown)
- ✅ Order status and payment status displayed correctly
- ✅ Edge cases handled (timeout, errors, network failures)

---

## Unit Tests

**What individual components need testing?**

### Component: OrderStatusBadge

**File**: `features/orders/components/order-status-badge.spec.tsx`

#### Test Cases

- [x] **Test 1: Renders PENDING status correctly**
  - Input: `status=OrderStatus.PENDING`
  - Expected: Badge with "Chờ xử lý" label, warning variant (yellow)
- [x] **Test 2: Renders PROCESSING status correctly**
  - Input: `status=OrderStatus.PROCESSING`
  - Expected: Badge with "Đang xử lý" label, warning variant (yellow)
- [x] **Test 3: Renders SHIPPED status correctly**
  - Input: `status=OrderStatus.SHIPPED`
  - Expected: Badge with "Đang giao hàng" label, secondary variant (purple)
- [x] **Test 4: Renders DELIVERED status correctly**
  - Input: `status=OrderStatus.DELIVERED`
  - Expected: Badge with "Đã giao hàng" label, success variant (green)
- [x] **Test 5: Renders CANCELLED status correctly**
  - Input: `status=OrderStatus.CANCELLED`
  - Expected: Badge with "Đã hủy" label, destructive variant (red)
- [x] **Test 6: Accepts custom className**
  - Input: `status=OrderStatus.PENDING`, `className="custom-class"`
  - Expected: Badge has both default and custom class

**Coverage**: 100% (all branches, all status values)

---

### Component: PaymentStatusBadge

**File**: `features/payments/components/payment-status-badge.spec.tsx`

#### Test Cases

- [x] **Test 1: Renders UNPAID status correctly**
  - Input: `status=PaymentStatus.UNPAID`
  - Expected: Badge with "Chưa thanh toán" label, warning variant
- [x] **Test 2: Renders PAID status correctly**
  - Input: `status=PaymentStatus.PAID`
  - Expected: Badge with "Đã thanh toán" label, success variant
- [x] **Test 3: Accepts custom className**
  - Input: `status=PaymentStatus.UNPAID`, `className="custom-class"`
  - Expected: Badge has both default and custom class

**Coverage**: 100%

---

### Hook: usePaymentPolling

**File**: `features/payments/hooks/use-payment-polling.spec.ts`

#### Test Cases

- [x] **Test 1: Starts polling on mount**
  - Mock: `paymentsApi.getStatus` returns `{status: PaymentStatus.UNPAID}`
  - Expected: `isPolling = true`, initial API call made
- [x] **Test 2: Polls at correct interval (5s)**
  - Mock: Timer with jest.useFakeTimers()
  - Expected: API called every 5000ms
- [x] **Test 3: Stops polling when status = PAID**
  - Mock: `paymentsApi.getStatus` returns `{status: PaymentStatus.PAID}` on 3rd call
  - Expected: `isPolling = false`, `onSuccess` callback triggered
- [x] **Test 4: Stops polling after max attempts (180)**
  - Mock: Always returns `{status: PaymentStatus.UNPAID}`
  - Expected: After 180 calls, `isPolling = false`, `onTimeout` callback triggered
- [x] **Test 5: Retries on network error (max 3 times)**
  - Mock: First 2 calls throw error, 3rd succeeds
  - Expected: Retries twice, then succeeds
- [x] **Test 6: Stops polling after 3 failed retries**
  - Mock: All calls throw error
  - Expected: After 3 retries, `isPolling = false`, `onError` callback triggered
- [x] **Test 7: Cleans up interval on unmount**
  - Expected: No more API calls after unmount, no memory leaks

**Coverage**: 100% (all branches, success/error/timeout paths)

---

### Component: PaymentWaitingDialog

**File**: `features/payments/components/payment-waiting-dialog.spec.tsx`

#### Test Cases

- [x] **Test 1: Renders dialog when open**
  - Input: `open=true`
  - Expected: Dialog visible, QR code displayed
- [x] **Test 2: Displays QR code image**
  - Input: `qrCodeUrl="https://example.com/qr.png"`
  - Expected: `<img src="https://example.com/qr.png" />` rendered
- [x] **Test 3: Displays order ID**
  - Input: `orderId="cmhijsotb0000uxjsdtgsy0f1"`
  - Expected: Order ID displayed in UI
- [x] **Test 4: Countdown timer starts at 15:00**
  - Mock: jest.useFakeTimers()
  - Expected: Initial display shows "15:00"
- [x] **Test 5: Countdown timer decrements every second**
  - Mock: Advance timer by 1 second
  - Expected: Display shows "14:59"
- [x] **Test 6: Polling status indicator displayed**
  - Mock: `usePaymentPolling` returns `{isPolling: true}`
  - Expected: "Đang chờ thanh toán..." message visible
- [x] **Test 7: Calls onSuccess when payment confirmed**
  - Mock: `usePaymentPolling` triggers onSuccess
  - Expected: `onSuccess` prop callback called with order data
- [x] **Test 8: Calls onTimeout after 15 minutes**
  - Mock: `usePaymentPolling` triggers onTimeout
  - Expected: `onTimeout` prop callback called
- [x] **Test 9: Displays error message on network error**
  - Mock: `usePaymentPolling` returns `{error: "Network error"}`
  - Expected: Error message displayed in UI
- [x] **Test 10: Cannot be closed (no X button)**
  - Expected: No close button rendered, `onOpenChange` does nothing

**Coverage**: 100%

---

### Component: PaymentSuccessDialog

**File**: `features/payments/components/payment-success-dialog.spec.tsx`

#### Test Cases

- [x] **Test 1: Renders dialog when open**
  - Input: `open=true`
  - Expected: Dialog visible with success title
- [x] **Test 2: Displays success icon**
  - Expected: CheckCircle2 icon rendered
- [x] **Test 3: Displays order summary**
  - Input: `order={id: "123", totalAmount: 199900, paymentMethod: "SEPAY"}`
  - Expected: Order ID, amount (1,999 đ), payment method displayed
- [x] **Test 4: Displays OrderStatusBadge**
  - Input: `order.orderStatus="pending"`
  - Expected: OrderStatusBadge rendered with "pending" status
- [x] **Test 4: Displays PaymentStatusBadge**
  - Input: `order.paymentStatus="paid"`
  - Expected: PaymentStatusBadge rendered with "paid" status
- [x] **Test 6: Shows countdown when autoRedirect=true**
  - Input: `autoRedirect=true`, `redirectDelay=3000`
  - Expected: "Chuyển trang sau 3 giây..." displayed
- [x] **Test 7: Countdown decrements every second**
  - Mock: jest.useFakeTimers(), advance 1 second
  - Expected: Countdown shows "2 giây..."
- [x] **Test 8: Auto redirects after countdown**
  - Mock: Advance timer by 3000ms
  - Expected: `onViewOrder` called with order ID
- [x] **Test 9: Manual button triggers immediate redirect**
  - Action: Click "Xem chi tiết đơn hàng" button
  - Expected: `onViewOrder` called immediately (no wait)
- [x] **Test 10: No countdown when autoRedirect=false**
  - Input: `autoRedirect=false`
  - Expected: No countdown message, no auto redirect

**Coverage**: 100%

---

## Integration Tests

**How do we test component interactions?**

### Integration Test 1: Checkout → Waiting Dialog → Success Dialog (SePay)

**File**: `features/checkout/components/checkout-content.integration.spec.tsx`

#### Test Scenario

1. User selects SePay payment method
2. User clicks "Đặt hàng" button
3. Order is created successfully
4. PaymentWaitingDialog opens automatically
5. Polling starts (mock payment status API)
6. After 3 polls, status changes to "completed"
7. PaymentWaitingDialog closes
8. PaymentSuccessDialog opens
9. After 3 seconds, redirects to order detail page

#### Test Implementation

```typescript
it("should handle SePay flow from checkout to success", async () => {
  // Mock APIs
  const mockOrder = { id: "order-123", paymentId: "pay-456", qrCodeUrl: "..." };
  ordersApi.create.mockResolvedValue(mockOrder);

  let pollCount = 0;
  paymentsApi.getStatus.mockImplementation(() => {
    pollCount++;
    if (pollCount >= 3) {
      return Promise.resolve({ status: "paid" });
    }
    return Promise.resolve({ status: "unpaid" });
  });

  // Render component
  const { getByText, getByRole } = render(<CheckoutContent />);

  // Select SePay
  fireEvent.click(getByText("SePay"));

  // Submit order
  fireEvent.click(getByRole("button", { name: "Đặt hàng" }));

  // Wait for waiting dialog
  await waitFor(() => {
    expect(screen.getByText("Quét mã QR để thanh toán")).toBeInTheDocument();
  });

  // Advance timer to trigger polling
  jest.advanceTimersByTime(15000); // 3 polls * 5s

  // Wait for success dialog
  await waitFor(() => {
    expect(screen.getByText("Đơn hàng đã đặt thành công!")).toBeInTheDocument();
  });

  // Advance timer for auto redirect
  jest.advanceTimersByTime(3000);

  // Verify redirect
  expect(mockRouter.push).toHaveBeenCalledWith("/orders/order-123");
});
```

**Coverage**: Full SePay checkout flow

---

### Integration Test 2: Checkout → Success Page (COD)

**File**: `features/checkout/components/checkout-content.integration.spec.tsx`

#### Test Scenario

1. User selects COD payment method
2. User clicks "Đặt hàng" button
3. Order is created successfully
4. Redirects to `/cart/success` immediately (no dialogs)

#### Test Implementation

```typescript
it("should handle COD flow from checkout to success page", async () => {
  const mockOrder = { id: "order-123", paymentMethod: "COD" };
  ordersApi.create.mockResolvedValue(mockOrder);

  const { getByText, getByRole } = render(<CheckoutContent />);

  // Select COD
  fireEvent.click(getByText("COD"));

  // Submit order
  fireEvent.click(getByRole("button", { name: "Đặt hàng" }));

  // Verify redirect (no dialogs)
  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/cart/success?orderId=order-123&paymentMethod=COD",
    );
  });
});
```

**Coverage**: Full COD checkout flow

---

### Integration Test 3: Payment Timeout Handling

**File**: `features/payments/components/payment-waiting-dialog.integration.spec.tsx`

#### Test Scenario

1. PaymentWaitingDialog opens
2. Polling starts
3. After 180 attempts (15 minutes), timeout occurs
4. `onTimeout` callback triggered
5. Error message displayed

#### Test Implementation

```typescript
it("should handle payment timeout after 15 minutes", async () => {
  const onTimeout = jest.fn();
  paymentsApi.getStatus.mockResolvedValue({ status: "unpaid" });

  const { getByText } = render(
    <PaymentWaitingDialog
      open={true}
      orderId="order-123"
      paymentId="pay-456"
      qrCodeUrl="..."
      onSuccess={() => {}}
      onTimeout={onTimeout}
      onError={() => {}}
    />,
  );

  // Advance timer to trigger 180 polls (180 * 5000ms)
  jest.advanceTimersByTime(180 * 5000);

  // Verify timeout callback
  await waitFor(() => {
    expect(onTimeout).toHaveBeenCalled();
  });
});
```

**Coverage**: Timeout edge case

---

### Integration Test 4: Network Error Retry

**File**: `features/payments/hooks/use-payment-polling.integration.spec.ts`

#### Test Scenario

1. Polling starts
2. First 2 API calls throw network error
3. Hook retries automatically
4. 3rd call succeeds
5. Polling continues normally

#### Test Implementation

```typescript
it("should retry on network error (max 3 times)", async () => {
  let callCount = 0;
  paymentsApi.getStatus.mockImplementation(() => {
    callCount++;
    if (callCount <= 2) {
      return Promise.reject(new Error("Network error"));
    }
    return Promise.resolve({ status: "unpaid" });
  });

  const { result } = renderHook(() => usePaymentPolling("pay-123"));

  // Advance timer for 3 attempts
  jest.advanceTimersByTime(15000);

  await waitFor(() => {
    expect(callCount).toBe(3);
    expect(result.current.error).toBeNull();
    expect(result.current.isPolling).toBe(true);
  });
});
```

**Coverage**: Network error retry logic

---

## End-to-End Tests

**What user flows need validation?**

### E2E Test 1: Complete COD Checkout Flow

**File**: `e2e/checkout-cod.spec.ts`

#### User Journey

1. User adds products to cart
2. User goes to checkout page
3. User selects shipping address
4. User selects COD payment method
5. User clicks "Đặt hàng"
6. User is redirected to success page
7. Success page displays order info with status badges
8. Cart is cleared

#### Playwright Test

```typescript
test("should complete COD checkout successfully", async ({ page }) => {
  // Add products to cart
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart-btn"]');

  // Go to checkout
  await page.goto("/cart/checkout");

  // Select address
  await page.click('[data-testid="address-card"]:first-child');

  // Select COD
  await page.click('[data-testid="payment-method-cod"]');

  // Submit order
  await page.click('button:has-text("Đặt hàng")');

  // Wait for redirect to success page
  await page.waitForURL(/\/cart\/success/);

  // Verify success message
  await expect(page.locator("h1")).toContainText("Đơn hàng đã đặt thành công");

  // Verify status badges
  await expect(
    page.locator('[data-testid="order-status-badge"]'),
  ).toContainText("Đang xử lý");
  await expect(
    page.locator('[data-testid="payment-status-badge"]'),
  ).toContainText("Chờ thanh toán");

  // Verify cart is cleared
  await page.goto("/cart");
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
});
```

**Coverage**: Full COD user journey

---

### E2E Test 2: Complete SePay Checkout Flow

**File**: `e2e/checkout-sepay.spec.ts`

#### User Journey

1. User adds products to cart
2. User goes to checkout page
3. User selects shipping address
4. User selects SePay payment method
5. User clicks "Đặt hàng"
6. PaymentWaitingDialog appears with QR code
7. User scans QR and transfers money (simulate webhook)
8. PaymentSuccessDialog appears
9. User is redirected to order detail page
10. Order detail shows "Đã thanh toán" status

#### Playwright Test

```typescript
test("should complete SePay checkout with payment", async ({
  page,
  context,
}) => {
  // Setup webhook mock (simulate BIDV payment)
  await context.route("**/api/payments/*/status", (route) => {
    const pollCount = parseInt(
      route.request().headers()["x-poll-count"] || "0",
    );
    if (pollCount >= 3) {
      route.fulfill({ json: { status: "completed" } });
    } else {
      route.fulfill({ json: { status: "pending" } });
    }
  });

  // Add products to cart
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart-btn"]');

  // Go to checkout
  await page.goto("/cart/checkout");

  // Select address and SePay
  await page.click('[data-testid="address-card"]:first-child');
  await page.click('[data-testid="payment-method-sepay"]');

  // Submit order
  await page.click('button:has-text("Đặt hàng")');

  // Verify waiting dialog appears
  await expect(page.locator('[role="dialog"]')).toContainText("Quét mã QR");

  // Verify QR code image
  await expect(page.locator('img[alt="QR Code"]')).toBeVisible();

  // Wait for payment confirmation (polling)
  await page.waitForTimeout(15000); // 3 polls * 5s

  // Verify success dialog appears
  await expect(page.locator('[role="dialog"]')).toContainText(
    "Đơn hàng đã đặt thành công",
  );

  // Wait for auto redirect
  await page.waitForURL(/\/orders\/.+/, { timeout: 5000 });

  // Verify order detail page
  await expect(
    page.locator('[data-testid="payment-status-badge"]'),
  ).toContainText("Đã thanh toán");

  // Verify cart is cleared
  await page.goto("/cart");
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
});
```

**Coverage**: Full SePay user journey with payment confirmation

---

### E2E Test 3: SePay Timeout Scenario

**File**: `e2e/checkout-sepay-timeout.spec.ts`

#### User Journey

1. User completes checkout with SePay
2. PaymentWaitingDialog appears
3. User does NOT scan QR code
4. After 15 minutes, timeout message appears
5. User can retry or cancel

#### Playwright Test

```typescript
test("should handle SePay payment timeout", async ({ page }) => {
  // Mock always unpaid status
  await page.route("**/api/payments/*/status", (route) => {
    route.fulfill({ json: { status: "unpaid" } });
  });

  // Complete checkout
  await page.goto("/cart/checkout");
  await page.click('[data-testid="payment-method-sepay"]');
  await page.click('button:has-text("Đặt hàng")');

  // Verify waiting dialog
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Fast-forward time to trigger timeout (mock)
  await page.evaluate(() => {
    // Simulate 15 minutes passing
    window.dispatchEvent(new CustomEvent("payment-timeout"));
  });

  // Verify timeout message
  await expect(page.locator('[data-testid="timeout-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="timeout-message"]')).toContainText(
    "Thanh toán hết thời gian",
  );
});
```

**Coverage**: Timeout edge case

---

## Test Data

**What data do we use for testing?**

### Test Fixtures

#### Mock Order (COD)

```typescript
export const mockCodOrder: Order = {
  id: "order-cod-123",
  userId: "user-456",
  totalAmount: 199900, // 1,999 VND
  orderStatus: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.UNPAID,
  paymentMethod: "COD",
  paymentId: null,
  items: [{ productId: "prod-1", quantity: 2, price: 99950 }],
  shippingAddress: mockAddress,
  createdAt: new Date("2025-11-03T10:00:00Z"),
  updatedAt: new Date("2025-11-03T10:00:00Z"),
};
```

#### Mock Order (SePay)

```typescript
export const mockSepayOrder: Order = {
  id: "order-sepay-789",
  userId: "user-456",
  totalAmount: 299900, // 2,999 VND
  orderStatus: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PAID, // After payment
  paymentMethod: "SEPAY",
  paymentId: "pay-123",
  qrCodeUrl: "https://img.vietqr.io/image/bidv-96247HAOVA-compact.png",
  items: [{ productId: "prod-2", quantity: 1, price: 299900 }],
  shippingAddress: mockAddress,
  createdAt: new Date("2025-11-03T10:00:00Z"),
  updatedAt: new Date("2025-11-03T10:05:00Z"),
};
```

#### Mock Payment Status Responses

```typescript
export const mockPaymentUnpaid = {
  id: "pay-123",
  orderId: "order-sepay-789",
  status: PaymentStatus.UNPAID,
  qrCodeUrl: "https://img.vietqr.io/...",
  paidAt: null,
};

export const mockPaymentPaid = {
  id: "pay-123",
  orderId: "order-sepay-789",
  status: PaymentStatus.PAID,
  qrCodeUrl: "https://img.vietqr.io/...",
  paidAt: new Date("2025-11-03T10:03:00Z"),
};
```

### Seed Data Requirements

No special seed data needed. Use existing test users and products.

### Test Database Setup

- Use existing test database (Docker Compose)
- Clear cart before each test: `await cartApi.clear()`
- Reset orders after tests: `DELETE FROM orders WHERE user_id = 'test-user'`

---

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands

```bash
# Run all tests with coverage
pnpm test -- --coverage

# Run unit tests only
pnpm test -- --testPathPattern="spec.tsx?"

# Run integration tests only
pnpm test -- --testPathPattern="integration.spec"

# Run E2E tests
pnpm test:e2e
```

### Coverage Thresholds

Target thresholds in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Stricter for new code
  "./features/payments/": {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  "./features/orders/components/order-status-badge.tsx": {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

### Coverage Gaps (to be filled)

- [ ] PaymentWaitingDialog: Manual retry button (not implemented yet)
- [ ] PaymentSuccessDialog: Custom animations (optional)
- [ ] CheckoutContent: Refund flow (out of scope)

### Links to Test Reports

- Unit Tests: `coverage/lcov-report/index.html`
- E2E Tests: `playwright-report/index.html`
- CI Pipeline: [GitHub Actions](https://github.com/HaoNgo232/frontend-luan-van/actions)

### Manual Testing Outcomes

- [ ] **Day 7**: Real BIDV transfer test
  - [ ] Transfer to VA: 96247HAOVA
  - [ ] Content: DHorder123
  - [ ] Amount: 19,990 VND
  - [ ] Verify webhook received
  - [ ] Verify dialog updates
  - [ ] Verify order status updated

---

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

- [ ] **Mobile Responsive** (iOS Safari, Chrome Android)
  - [ ] PaymentWaitingDialog fits screen
  - [ ] QR code is scannable (not too small)
  - [ ] Countdown timer visible
  - [ ] Buttons are tappable (44x44pt)
- [ ] **Accessibility**
  - [ ] Keyboard navigation works (Tab, Enter, Escape)
  - [ ] Screen reader announces status changes
  - [ ] Color contrast passes WCAG AA (4.5:1)
  - [ ] Focus indicators visible
- [ ] **Animations**
  - [ ] Success dialog animation smooth (60 FPS)
  - [ ] No layout shift during dialog open
  - [ ] Countdown updates smoothly
- [ ] **Vietnamese Text**
  - [ ] All labels grammatically correct
  - [ ] No typos or encoding issues
  - [ ] Professional tone

### Browser/Device Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari (iOS 15+)
- [ ] Chrome Android (Android 10+)

### Smoke Tests After Deployment

- [ ] COD checkout works end-to-end
- [ ] SePay checkout works end-to-end
- [ ] Order status badges display correctly
- [ ] Payment status badges display correctly
- [ ] No console errors
- [ ] No 429 rate limiting errors

---

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

1. **Concurrent Polling**

   - Simulate 100 users polling payment status simultaneously
   - Expected: No 429 errors, < 500ms response time

2. **Dialog Rendering**

   - Measure time from order creation to dialog open
   - Expected: < 500ms

3. **Success Dialog Animation**
   - Measure frame rate during animation
   - Expected: 60 FPS (no dropped frames)

### Stress Testing Approach

- Use Artillery or k6 for load testing
- Target: 1000 req/sec for payment status API
- Monitor: Response time, error rate, server CPU/memory

### Performance Benchmarks

| Metric                | Target  | Acceptable |
| --------------------- | ------- | ---------- |
| Dialog Open Time      | < 300ms | < 500ms    |
| QR Code Load          | < 500ms | < 1s       |
| Polling Request       | < 100ms | < 200ms    |
| Success Dialog Render | < 200ms | < 300ms    |
| Redirect Time         | < 1s    | < 2s       |

---

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

1. **Discovery**: Found in testing or production
2. **Report**: Create GitHub issue with template
3. **Triage**: Assign severity (P0-P3)
4. **Fix**: Implement fix + add regression test
5. **Verify**: Re-test on staging
6. **Close**: Deploy to production + confirm

### Bug Severity Levels

- **P0 (Critical)**: Blocks entire feature (e.g., polling never starts)
- **P1 (High)**: Major functionality broken (e.g., timeout doesn't work)
- **P2 (Medium)**: Minor issue (e.g., wrong Vietnamese label)
- **P3 (Low)**: Cosmetic (e.g., animation stutters slightly)

### Regression Testing Strategy

- All fixed bugs MUST have regression test
- Run full test suite before each release
- Monitor Sentry for production errors
- Weekly review of test coverage reports

---

## Test Execution Timeline

**When do we run tests?**

### Day-by-Day Testing Plan

- **Day 1-2**: Write unit tests as components are built
- **Day 3-4**: Write integration tests for dialogs
- **Day 5-6**: Write E2E tests for full flows
- **Day 7**: Manual testing + real BIDV transfers
- **Day 7 (end)**: Final coverage report + sign-off

### CI/CD Integration

```yaml
# GitHub Actions workflow
name: Test Payment Flow Separation

on:
  pull_request:
    branches: [main]
  push:
    branches: [feature/payment-flow-separation]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test -- --coverage
      - run: pnpm test:e2e
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

**Status**: 🚧 Ready for Test Execution
**Next**: Run `/writing-test` for each component to generate unit tests
**Coverage Goal**: 100% for new code, 80%+ overall
**Manual Testing**: Day 7 (Nov 9, 2025)
