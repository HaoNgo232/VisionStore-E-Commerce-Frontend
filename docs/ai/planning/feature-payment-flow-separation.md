---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
feature: payment-flow-separation
created: 2025-11-03
---

# Project Planning & Task Breakdown: Payment Flow Separation

## Milestones

**What are the major checkpoints?**

- [x] **Milestone 1: Foundation** (Day 1-2) - Status badges + polling hook
- [x] **Milestone 2: Core Dialogs** (Day 3-4) - PaymentWaitingDialog + PaymentSuccessDialog ✅ COMPLETED
- [~] **Milestone 3: Integration** (Day 5-6) - Refactor checkout + success page
- [ ] **Milestone 4: Testing & Polish** (Day 7) - E2E tests + bug fixes

**Target Completion**: 7 days (Nov 3 - Nov 9, 2025)

## Task Breakdown

**What specific work needs to be done?**

---

### Phase 1: Foundation & Shared Components (Day 1-2)

**Goal**: Create reusable components and hooks needed by other features

#### ✅ Task 1.1: Create OrderStatusBadge Component

**File**: `features/orders/components/order-status-badge.tsx`

**Subtasks**:

- [x] Define OrderStatus enum in types
- [x] Create component with shadcn Badge
- [x] Implement status color mapping
- [x] Add TypeScript types
- [x] Write unit tests (target: 100% coverage)
  - Test each status renders correct label
  - Test each status renders correct color
  - Test className prop override

**Acceptance Criteria**:

- ✅ Displays 5 status types: pending, confirmed, shipped, delivered, cancelled
- ✅ Uses semantic colors: yellow, blue, purple, green, red
- ✅ Vietnamese labels: "Chờ xử lý", "Đang xử lý", "Đang giao hàng", "Đã giao hàng", "Đã hủy"
- ✅ Supports custom className
- ✅ Unit tests pass

**Estimate**: 2 hours

---

#### ✅ Task 1.2: Create PaymentStatusBadge Component

**File**: `features/payments/components/payment-status-badge.tsx`

**Subtasks**:

- [x] Define PaymentStatus enum in types
- [x] Create component with shadcn Badge
- [x] Implement status color mapping
- [x] Add TypeScript types
- [x] Write unit tests (target: 100% coverage)
  - Test each status renders correct label
  - Test each status renders correct color

**Acceptance Criteria**:

- ✅ Displays 2 status types: UNPAID, PAID
- ✅ Uses semantic colors: yellow, green
- ✅ Vietnamese labels: "Chưa thanh toán", "Đã thanh toán"
- ✅ Unit tests pass

**Estimate**: 1.5 hours

---

#### ✅ Task 1.3: Create usePaymentPolling Hook

**File**: `features/payments/hooks/use-payment-polling.ts`

**Subtasks**:

- [x] Implement polling logic with setInterval
- [x] Add automatic retry on network error (3 attempts)
- [x] Implement max attempts limit (180 = 15 min)
- [x] Add cleanup on unmount
- [x] Handle offline/online detection
- [x] Export hook with TypeScript types
- [x] Write unit tests (target: 100% coverage)
  - Test polling starts and stops correctly
  - Test interval timing (5s)
  - Test max attempts reached
  - Test success callback triggered
  - Test error retry logic

**Acceptance Criteria**:

- ✅ Polls every 5 seconds
- ✅ Max 180 attempts (15 minutes)
- ✅ Stops on status = PAID
- ✅ Retries 3 times on network error
- ✅ Calls onSuccess/onTimeout/onError callbacks
- ✅ Cleans up interval on unmount
- ✅ Unit tests pass

**Estimate**: 3 hours

---

#### ✅ Task 1.4: Update Type Definitions

**Files**: `types/order.types.ts`, `types/payment.types.ts`

**Subtasks**:

- [x] Add OrderStatus enum
- [x] Add PaymentStatus enum
- [x] Add orderStatus field to Order interface
- [x] Add paymentStatus field to Order interface
- [x] Add qrCodeUrl to Payment interface
- [x] Update CreateOrderRequest type
- [x] Export new types from `types/index.ts`

**Acceptance Criteria**:

- ✅ All status enums defined
- ✅ Order and Payment interfaces updated
- ✅ No TypeScript errors
- ✅ Exported from index

**Estimate**: 1 hour

---

### Phase 2: Core Dialog Components (Day 3-4)

**Goal**: Build PaymentWaitingDialog and PaymentSuccessDialog

#### ✅ Task 2.1: Create PaymentWaitingDialog Component

**File**: `features/payments/components/payment-waiting-dialog.tsx`

**Subtasks**:

- [x] Create component structure with shadcn Dialog
- [x] Add QR code display (reuse SepayQRDisplay or inline)
- [x] Integrate usePaymentPolling hook
- [x] Add countdown timer (15 minutes)
- [x] Display order info (ID, amount)
- [x] Add manual account info (copy buttons)
- [x] Add loading spinner during polling
- [x] Prevent dialog close (modal behavior)
- [x] Handle timeout state
- [x] Handle error state with retry button
- [x] Write unit tests (target: 100% coverage)
  - Test dialog opens with correct props
  - Test QR code renders
  - Test polling integration
  - Test timeout callback triggered
  - Test error callback triggered
- [x] Write integration test
  - Test full polling flow (mock API)

**Acceptance Criteria**:

- ✅ Dialog opens immediately with QR code
- ✅ Shows countdown timer (15:00 → 0:00)
- ✅ Polls payment status every 5s
- ✅ Calls onSuccess when status = 'completed'
- ✅ Calls onTimeout after 15 minutes
- ✅ Shows error message with retry on network error
- ✅ Cannot be closed during polling (no X button)
- ✅ Unit + integration tests pass

**Estimate**: 5 hours

---

#### ✅ Task 2.2: Create PaymentSuccessDialog Component

**File**: `features/payments/components/payment-success-dialog.tsx`

**Subtasks**:

- [x] Create component structure with shadcn Dialog
- [x] Add success animation (CSS bounce + ping)
- [x] Display order summary (ID, amount, payment method)
- [x] Add OrderStatusBadge
- [x] Add PaymentStatusBadge
- [x] Add "Xem chi tiết đơn hàng" button
- [x] Implement auto-redirect with countdown (3s)
- [x] Add manual close button
- [x] Handle redirect callback
- [x] Write unit tests (target: 100% coverage)
  - Test dialog renders with order data
  - Test status badges display correctly
  - Test button triggers onViewOrder callback
  - Test auto-redirect after 3s
- [x] Write integration test
  - Test countdown timer
  - Test manual vs auto redirect

**Acceptance Criteria**:

- ✅ Dialog shows success animation
- ✅ Displays order summary with status badges
- ✅ Shows countdown: "Chuyển trang sau 3 giây..."
- ✅ Auto redirects after 3s (default)
- ✅ Can manually click "Xem chi tiết" (immediate redirect)
- ✅ Can be closed with X button
- ✅ Unit + integration tests pass (20/20 tests)

**Estimate**: 4 hours | **Actual**: 3 hours | **Status**: ✅ COMPLETED

---

### Phase 3: Integration & Refactoring (Day 5-6)

**Goal**: Connect dialogs to checkout flow and update existing pages

#### ✅ Task 3.1: Refactor CheckoutContent Component

**File**: `features/checkout/components/checkout-content.tsx`

**Subtasks**:

- [x] Add state for dialog visibility
  ```typescript
  const [waitingDialogOpen, setWaitingDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  ```
- [x] Split handleCheckout logic:
  - COD: redirect to `/cart/success`
  - SePay: open PaymentWaitingDialog
- [x] Add PaymentWaitingDialog component
- [x] Add PaymentSuccessDialog component
- [x] Implement onSuccess handler:
  - Close waiting dialog
  - Fetch full order data
  - Open success dialog
- [x] Implement onTimeout handler:
  - Show toast error
  - Optionally redirect to orders page
- [x] Update error handling
- [ ] Write integration tests
  - Test COD flow (end-to-end)
  - Test SePay flow (end-to-end)
  - Test timeout scenario
  - Test network error scenario

**Acceptance Criteria**:

- ✅ COD: Redirects to success page immediately
- ✅ SePay: Opens waiting dialog with QR
- ✅ Success dialog appears when payment confirmed
- ✅ Redirects to order detail after success
- ✅ Handles errors gracefully
- ✅ Integration tests pass

**Estimate**: 4 hours | **Status**: ✅ Completed (code merged)

---

#### ✅ Task 3.2: Update Success Page for COD Only

**File**: `app/(shop)/cart/success/page.tsx`

**Subtasks**:

- [x] Add payment method check
  ```typescript
  const paymentMethod = searchParams.get("paymentMethod");
  if (paymentMethod !== "COD") {
    redirect("/orders"); // SePay should not reach here
  }
  ```
- [x] Remove SePay-specific logic:
  - Remove SepayQRDisplay component
  - Remove payment status polling
- [x] Keep COD logic:
  - Fetch order
  - Clear cart
  - Show success message
  - Display order summary
- [x] Add OrderStatusBadge
- [x] Add PaymentStatusBadge (show "Chờ thanh toán")
- [ ] Write unit tests
  - Test COD flow renders correctly
  - Test SePay redirects away
- [ ] Write E2E test
  - Test full COD checkout → success page

**Acceptance Criteria**:

- ✅ COD orders display success page
- ✅ SePay orders redirect to /orders
- ✅ Displays order status badge
- ✅ Displays payment status badge
- ✅ Cart is cleared
- ✅ Tests pass

**Estimate**: 2 hours | **Status**: ✅ Completed (code merged)

---

#### ✅ Task 3.3: Create/Update Order Detail Page

**File**: `app/(shop)/orders/[id]/page.tsx` (check if exists)

**Subtasks**:

- [ ] Check if order detail page exists
  - If NO: Create new page
  - If YES: Update to include status badges
- [ ] Implement order detail layout:
  - Order ID and timestamps
  - OrderStatusBadge
  - PaymentStatusBadge
  - Payment method and amount
  - Shipping address
  - Product list with quantities
  - Total amount
- [ ] Fetch order data on mount
- [ ] Add loading state
- [ ] Add error state (order not found)
- [ ] Write unit tests
  - Test page renders with order data
  - Test status badges display
  - Test loading state
  - Test error state

**Acceptance Criteria**:

- ✅ Page exists at `/orders/:id`
- ✅ Displays full order information
- ✅ Shows order status badge
- ✅ Shows payment status badge
- ✅ Handles loading and error states
- ✅ Tests pass

**Estimate**: 3 hours (if creating new page), 1.5 hours (if updating existing)

---

#### ✅ Task 3.4: Update Order List Page (if exists)

**File**: `app/(shop)/orders/page.tsx` or `app/(account)/profile/orders/page.tsx`

**Subtasks**:

- [ ] Find order list page location
- [ ] Add OrderStatusBadge to each order row
- [ ] Add PaymentStatusBadge to each order row
- [ ] Update table/card layout to accommodate badges
- [ ] Ensure badges are responsive (mobile)
- [ ] Write unit tests
  - Test badges render for each order

**Acceptance Criteria**:

- ✅ Order list displays status badges
- ✅ Badges are visible on mobile
- ✅ Tests pass

**Estimate**: 1.5 hours

---

### Phase 4: Testing & Polish (Day 7)

**Goal**: Comprehensive testing and UX refinements

#### ✅ Task 4.1: End-to-End Testing

**Files**: `e2e/checkout-cod.spec.ts`, `e2e/checkout-sepay.spec.ts`

**Subtasks**:

- [ ] Write E2E test: COD Flow
  - Add items to cart
  - Go to checkout
  - Select COD
  - Submit order
  - Verify redirect to success page
  - Verify order status badges
  - Verify cart is cleared
- [ ] Write E2E test: SePay Flow
  - Add items to cart
  - Go to checkout
  - Select SePay
  - Submit order
  - Verify waiting dialog opens
  - Mock payment webhook (mark as paid)
  - Verify success dialog appears
  - Verify redirect to order detail
  - Verify cart is cleared
- [ ] Write E2E test: SePay Timeout
  - Submit SePay order
  - Wait 15 minutes (mock time)
  - Verify timeout message
- [ ] Write E2E test: Network Error
  - Submit SePay order
  - Mock network error
  - Verify retry mechanism
- [ ] Run all E2E tests and verify pass

**Acceptance Criteria**:

- ✅ All E2E tests pass
- ✅ COD flow works end-to-end
- ✅ SePay flow works end-to-end
- ✅ Edge cases handled

**Estimate**: 4 hours

---

#### ✅ Task 4.2: Unit Test Coverage Verification

**Files**: All components and hooks

**Subtasks**:

- [ ] Run coverage report: `pnpm test -- --coverage`
- [ ] Verify coverage > 80% for all new files
- [ ] Identify gaps and write missing tests
- [ ] Document coverage results in testing doc
- [ ] Fix any failing tests

**Acceptance Criteria**:

- ✅ Overall coverage > 80%
- ✅ New components coverage > 90%
- ✅ All tests pass
- ✅ Coverage report saved

**Estimate**: 2 hours

---

#### ✅ Task 4.3: UX Polish & Refinements

**Files**: All dialog components, checkout page

**Subtasks**:

- [ ] Test on mobile devices (responsive)
- [ ] Test animations (smooth 60 FPS)
- [ ] Test keyboard navigation (accessibility)
- [ ] Test screen readers (NVDA/VoiceOver)
- [ ] Adjust timing if needed:
  - Polling interval (currently 5s)
  - Success dialog auto-redirect (currently 3s)
  - Timeout duration (currently 15 min)
- [ ] Add loading skeletons where appropriate
- [ ] Review Vietnamese text for clarity
- [ ] Test with slow network (throttling)
- [ ] Test with real BIDV transfers (production-like)

**Acceptance Criteria**:

- ✅ Works on mobile (iOS + Android)
- ✅ Animations are smooth
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ Text is clear and professional

**Estimate**: 3 hours

---

#### ✅ Task 4.4: Documentation Updates

**Files**: Implementation doc, testing doc

**Subtasks**:

- [ ] Update implementation doc with:
  - Final component structure
  - API integration notes
  - Known issues or limitations
- [ ] Update testing doc with:
  - Coverage results
  - Test cases executed
  - Outstanding gaps
- [ ] Create HTTP test files (optional):
  - `http/checkout-cod.http`
  - `http/checkout-sepay.http`
- [ ] Update README if needed

**Acceptance Criteria**:

- ✅ Implementation doc complete
- ✅ Testing doc complete
- ✅ HTTP test files created (optional)

**Estimate**: 1.5 hours

---

## Dependencies

**What needs to happen in what order?**

### Critical Path:

```
Task 1.4 (Types)
  → Task 1.1, 1.2 (Status Badges) → Task 2.2 (Success Dialog)
  → Task 1.3 (Polling Hook) → Task 2.1 (Waiting Dialog)
  → Task 3.1 (Checkout Refactor) → Task 4.1 (E2E Tests)

Task 3.2 (Success Page) ← can run in parallel with Task 2.x
Task 3.3 (Order Detail) ← can run in parallel with Task 2.x
Task 3.4 (Order List) ← depends on Task 1.1, 1.2 (badges)
```

### External Dependencies:

- ✅ Backend APIs already exist (no changes needed)
- ✅ Backend webhook already working (verified)
- ✅ BIDV Virtual Account configured (verified)
- ✅ shadcn/ui Dialog component installed
- ✅ Framer Motion installed (check package.json)

### Team/Resource Dependencies:

- **Designer approval**: Dialog UI/UX mockups (optional)
- **QA testing**: Manual testing on real devices (Day 7)
- **Stakeholder review**: Vietnamese text review (Day 6)

---

## Timeline & Estimates

**When will things be done?**

### Summary by Phase:

| Phase                     | Tasks        | Estimated Hours | Target Days |
| ------------------------- | ------------ | --------------- | ----------- |
| Phase 1: Foundation       | 1.1 - 1.4    | 7.5h            | Day 1-2     |
| Phase 2: Core Dialogs     | 2.1 - 2.2    | 9h              | Day 3-4     |
| Phase 3: Integration      | 3.1 - 3.4    | 12h             | Day 5-6     |
| Phase 4: Testing & Polish | 4.1 - 4.4    | 10.5h           | Day 7       |
| **TOTAL**                 | **13 tasks** | **39h**         | **7 days**  |

### Daily Breakdown:

- **Day 1** (Nov 3): Task 1.1, 1.2, 1.4 (5h)
- **Day 2** (Nov 4): Task 1.3, start 2.1 (6h)
- **Day 3** (Nov 5): Complete 2.1, start 2.2 (6h)
- **Day 4** (Nov 6): Complete 2.2, start 3.1 (5h)
- **Day 5** (Nov 7): Complete 3.1, 3.2, start 3.3 (6h)
- **Day 6** (Nov 8): Complete 3.3, 3.4, start 4.1 (6h)
- **Day 7** (Nov 9): Complete 4.1, 4.2, 4.3, 4.4 (5h)

### Buffer Time:

- Built-in: ~5 hours (for unexpected issues)
- Meetings/Code Review: ~2 hours
- **Total with buffer**: ~46 hours (realistic for 7 working days)

---

## Risks & Mitigation

**What could go wrong?**

### Risk 1: Backend Payment Status API Missing

**Probability**: Low  
**Impact**: High  
**Mitigation**:

- Verify API exists before starting (check with backend team)
- Fallback: Use existing payment polling endpoint (adjust frontend)

---

### Risk 2: Polling Causes Rate Limiting

**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:

- Use 5s interval (already tested, no 429 errors)
- Add exponential backoff on error
- Implement circuit breaker pattern if needed

---

### Risk 3: Dialog Components Too Complex

**Probability**: Low  
**Impact**: Medium  
**Mitigation**:

- Use existing shadcn Dialog (proven)
- Keep logic in custom hooks (separation of concerns)
- Timebox: If > 6h, simplify UX (remove animations)

---

### Risk 4: E2E Tests Flaky

**Probability**: Medium  
**Impact**: Low  
**Mitigation**:

- Use Playwright retry mechanism (3 attempts)
- Mock payment webhook for deterministic tests
- Run tests locally + CI before merge

---

### Risk 5: Order Detail Page Doesn't Exist

**Probability**: Medium  
**Impact**: High  
**Mitigation**:

- Check immediately (Task 3.3 discovery)
- If missing, create simple page (MVP)
- Allocate extra 3h for page creation

---

### Risk 6: Real BIDV Transfers Fail in Testing

**Probability**: Low  
**Impact**: High  
**Mitigation**:

- Use sandbox/test account for BIDV
- Manual testing with real transfers (Day 7)
- Rollback plan: Keep existing success page flow as fallback

---

## Resources Needed

**What do we need to succeed?**

### Team Members:

- **Developer**: 1 full-time (you!)
- **Designer**: Optional (UI/UX review, 2h)
- **QA Tester**: Manual testing on Day 7 (3h)
- **Backend Team**: Confirm API availability (30min)

### Tools & Services:

- ✅ VS Code + GitHub Copilot
- ✅ pnpm (package manager)
- ✅ Playwright (E2E tests)
- ✅ Jest (unit tests)
- ✅ shadcn/ui (Dialog, Badge)
- ⚠️ Framer Motion (check if installed, install if needed)
- ✅ Backend API (localhost:3000)
- ✅ BIDV Virtual Account (96247HAOVA)

### Infrastructure:

- ✅ Development environment (local)
- ✅ Backend services running (Docker Compose)
- ✅ PostgreSQL databases (all services)
- ✅ NATS message broker
- ⚠️ Staging environment (optional, for stakeholder demo)

### Documentation/Knowledge:

- ✅ Requirements doc (this feature)
- ✅ Design doc (this feature)
- ✅ Backend API docs (Postman collection)
- ✅ shadcn/ui docs (ui.shadcn.com)
- ✅ Framer Motion docs (if needed)

---

## Next Steps

**Current Status**: Milestone 3/4 In Progress ✅ (Task 3.1 done)

**Completed**:

- ✅ Task 1.1-1.4: Foundation components (OrderStatusBadge, PaymentStatusBadge, usePaymentPolling, types)
- ✅ Task 2.2: PaymentSuccessDialog component with full test coverage

**Next**: Continue Milestone 3 - Integration Phase

1. ⏭️ **IMMEDIATE**: Task 3.2 - Update Success Page (2h)

   - Make `/cart/success` COD-only (redirect SePay to /orders)
   - Fetch order, clear cart, show badges

2. ⏭️ **THEN**: Task 3.3 - Create/Update Order Detail Page (3h)

   - Ensure `/orders/:id` shows badges and full details

3. ⏭️ **FINAL**: Milestone 4 - Testing & Polish (Day 7)
   - E2E tests for complete payment flow
   - Bug fixes and UX improvements

**Ready to start Task 3.1?** Run `/execute-plan` để bắt đầu integration! 🚀
