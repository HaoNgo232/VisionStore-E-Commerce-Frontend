---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
feature: payment-flow-separation
created: 2025-11-03
---

# Requirements & Problem Understanding: Payment Flow Separation

## Problem Statement

**What problem are we solving?**

Hiện tại, hệ thống checkout hiển thị thông báo "Đơn hàng đã đặt thành công!" ngay lập tức cho TẤT CẢ các phương thức thanh toán (COD và SePay). Điều này gây ra những vấn đề sau:

### Vấn đề chính:

1. **Nhầm lẫn cho khách hàng SePay**: Khách hàng thấy thông báo success ngay lập tức nhưng CHƯA thanh toán, không biết phải làm gì tiếp theo
2. **Không có QR code ngay lập tức**: Khách hàng phải vào trang success page mới thấy QR code, tăng friction
3. **Thiếu feedback trong lúc chờ**: Không có thông báo khi thanh toán được xác nhận thành công
4. **UX không phù hợp**: COD (thanh toán khi nhận hàng) và SePay (thanh toán trước) có flow giống hệt nhau
5. **Thiếu trạng thái đơn hàng và thanh toán**: Khách hàng không thấy được trạng thái order status và payment status sau khi đặt hàng

### Người bị ảnh hưởng:

- **Khách hàng chọn SePay**: Trải nghiệm kém, không rõ ràng
- **Khách hàng chọn COD**: Trải nghiệm OK nhưng không tối ưu
- **Team support**: Phải giải thích cho khách hàng cách thanh toán SePay

### Hiện trạng/Workaround:

- Khách hàng phải scroll xuống trang success để tìm QR code
- Không biết thanh toán đã thành công hay chưa (phải F5 hoặc check email/SMS)
- Có thể thanh toán nhầm order ID

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals:

1. **Tách biệt rõ ràng flow COD vs SePay**

   - COD: Redirect ngay đến success page (thanh toán khi nhận hàng)
   - SePay: Hiển thị dialog chờ thanh toán → Confirm → Redirect đến order detail

2. **Cải thiện UX cho SePay**

   - Hiển thị QR code NGAY LẬP TỨC sau khi tạo order
   - Polling payment status realtime (5s interval)
   - Thông báo rõ ràng khi thanh toán thành công
   - Redirect đến trang order detail với đầy đủ thông tin

3. **Hiển thị trạng thái đơn hàng và thanh toán**
   - Order status: pending, confirmed, shipped, delivered, cancelled
   - Payment status: pending, completed, failed, refunded
   - Hiển thị rõ ràng trên order detail page và order list

### Secondary Goals:

- Giảm support tickets liên quan đến thanh toán SePay
- Tăng conversion rate cho SePay (giảm abandoned carts)
- Cải thiện trust và professional của platform

### Non-Goals (out of scope):

- ❌ Thêm payment methods mới (Momo, ZaloPay, etc.)
- ❌ Refund flow
- ❌ Payment retry mechanism
- ❌ Email/SMS notifications (có thể làm sau)
- ❌ Multiple payment methods per order

## User Stories & Use Cases

**How will users interact with the solution?**

### User Story 1: COD Payment Flow (Fast Path)

```
As a customer who prefers cash payment
When I choose COD payment method and click "Đặt hàng"
I want to see immediate order confirmation on success page
So that I know my order was placed successfully and I'll pay on delivery

Acceptance Criteria:
- ✅ Redirect to /cart/success immediately after order creation
- ✅ Show clear message: "Đơn hàng đã đặt thành công! Bạn sẽ thanh toán khi nhận hàng."
- ✅ Display order summary with order status
- ✅ Show "Chưa thanh toán" payment status
- ✅ Cart is cleared
- ✅ Can view order detail
```

### User Story 2: SePay QR Display (Immediate Feedback)

```
As a customer who chooses SePay
When I click "Đặt hàng" after selecting SePay
I want to see a dialog with QR code IMMEDIATELY
So that I can scan and transfer money right away without confusion

Acceptance Criteria:
- ✅ PaymentWaitingDialog appears immediately after order creation
- ✅ QR code is displayed prominently
- ✅ Shows clear instructions: "Vui lòng quét mã QR để thanh toán"
- ✅ Shows order amount and order ID
- ✅ Shows countdown timer (15 minutes)
- ✅ Can copy account info manually
- ✅ Dialog cannot be dismissed while polling (stay focused)
```

### User Story 3: SePay Payment Confirmation (Success Feedback)

```
As a customer who just transferred money via SePay
When the backend webhook receives my payment
I want to see a success notification automatically
So that I know my order is fully paid and being processed

Acceptance Criteria:
- ✅ Frontend polls payment status every 5 seconds
- ✅ When paymentStatus changes to PAID, close waiting dialog
- ✅ Show PaymentSuccessDialog with success animation
- ✅ Display order summary with "Đã thanh toán" status
- ✅ Show order status as PENDING (đang xử lý)
- ✅ Provide button "Xem chi tiết đơn hàng"
- ✅ Auto redirect after 3 seconds
```

### User Story 4: Order Detail Navigation (Post-Payment)

```
As a customer who completed SePay payment
After seeing the success dialog
I want to be redirected to my order detail page
So that I can track my order status, see payment proof, and save order info

Acceptance Criteria:
- ✅ Redirect to /orders/{orderId} (NOT /cart/success)
- ✅ Order detail page shows:
  - Order status badge (pending, confirmed, shipped, etc.)
  - Payment status badge (completed, pending, failed, etc.)
  - Payment method and amount
  - Shipping address
  - Product list with quantities
  - Timestamps (created, updated)
- ✅ Cart is cleared after successful payment
```

### User Story 5: Order & Payment Status Display

```
As a customer viewing my orders
When I visit order list or order detail pages
I want to see clear order status and payment status
So that I understand what's happening with my order and payment

Acceptance Criteria:
- ✅ Order status badges with colors:
  - pending (yellow): Đang xử lý
  - confirmed (blue): Đã xác nhận
  - shipped (purple): Đang giao hàng
  - delivered (green): Đã giao hàng
  - cancelled (red): Đã hủy
- ✅ Payment status badges with colors:
  - pending (yellow): Chờ thanh toán
  - completed (green): Đã thanh toán
  - failed (red): Thanh toán thất bại
  - refunded (gray): Đã hoàn tiền
- ✅ Displayed on both order list and order detail pages
- ✅ Status updates in realtime (no need F5)
```

### Edge Cases to Consider:

1. **Timeout**: SePay QR không được scan trong 15 phút

   - Show timeout message
   - Provide button to retry or cancel order

2. **Network error during polling**:

   - Show error message
   - Retry automatically (3 attempts)
   - Fallback: "Vui lòng kiểm tra lại sau"

3. **Duplicate payment**:

   - Backend handles idempotency
   - Frontend shows "Đã thanh toán" if payment already exists

4. **Browser refresh during SePay waiting**:

   - Detect incomplete order in cart
   - Show dialog to continue payment or cancel

5. **Multiple tabs/devices**:
   - Payment confirmed in one tab should update all tabs
   - Use localStorage + polling to sync

## Success Criteria

**How will we know when we're done?**

### Measurable Outcomes:

1. **UX Metrics**:

   - ✅ 95%+ of SePay users see QR code within 2 seconds of order creation
   - ✅ Average time to payment confirmation < 2 minutes
   - ✅ Bounce rate on success page < 10%
   - ✅ SePay completion rate > 80%

2. **Technical Metrics**:

   - ✅ Payment polling success rate > 99%
   - ✅ No 429 rate limiting errors
   - ✅ Dialog rendering time < 500ms
   - ✅ Order status updates within 5 seconds of backend change

3. **Business Metrics**:
   - ✅ Support tickets about "How to pay with SePay" reduced by 80%
   - ✅ SePay abandoned cart rate < 20%
   - ✅ Customer satisfaction score (CSAT) > 4.5/5

### Acceptance Criteria (Must-Have):

- ✅ COD flow: Direct redirect to success page
- ✅ SePay flow: Waiting dialog → Success dialog → Order detail
- ✅ QR code displayed immediately
- ✅ Payment status polling works without errors
- ✅ Order status and payment status clearly displayed
- ✅ Success dialog auto-redirects
- ✅ All edge cases handled gracefully
- ✅ No breaking changes to existing orders
- ✅ Unit tests coverage > 80%
- ✅ E2E tests for both flows pass

### Performance Benchmarks:

- Dialog open time: < 500ms
- QR code generation: < 1s
- Payment polling interval: 5s
- Max polling time: 15 minutes (180 attempts)
- Success dialog auto-close: 3s
- Order detail page load: < 2s

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints:

- Backend webhook có thể delay 5-30 giây (bank processing time)
- NATS message queue có timeout 5s
- Frontend polling phải tránh 429 rate limiting
- QR code format cố định theo SePay API
- Browser localStorage có thể bị disabled
- Mobile network có thể unstable

### Business Constraints:

- Chỉ support 2 payment methods: COD và SePay
- BIDV Virtual Account (VA) đã được setup sẵn
- Không thay đổi backend payment processing logic (chỉ frontend UX)
- Phải maintain backward compatibility với orders cũ

### Time/Budget Constraints:

- Deadline: 1 tuần (7 ngày)
- No additional backend API needed (reuse existing)
- No third-party UI libraries (use shadcn/ui)
- Development time: ~20-24 hours

### Assumptions:

1. Backend webhook hoạt động ổn định (đã test)
2. Payment status API trả về đúng format
3. User có internet connection để polling
4. User không close browser trong lúc chờ payment (hoặc có thể reopen)
5. Mobile users có thể scan QR (camera permission)
6. Order detail page đã tồn tại và có route `/orders/:id`

## Questions & Open Items

**What do we still need to clarify?**

### Unresolved Questions:

1. ❓ Nếu user close dialog trong lúc polling thì sao?

   - Option A: Prevent close, force user wait
   - Option B: Allow close, show notification "Thanh toán đang xử lý"
   - **Decision**: Option B (better UX)

2. ❓ Order detail page có sẵn chưa? Route là gì?

   - Need to check: `/orders/:id` or `/profile/orders/:id`?
   - **Decision**: `/orders/:id` (cleaner URL)

3. ❓ Success dialog có cần hiển thị thông tin gì ngoài "Thành công"?

   - Order ID, amount, payment method?
   - **Decision**: Yes, show order summary

4. ❓ Timeout 15 phút có hợp lý không?

   - Bank transfer thường mất 1-5 phút
   - **Decision**: 15 phút OK (safe buffer)

5. ❓ Order status và payment status có API riêng không?
   - Check ordersApi.getById() response format
   - **Decision**: Included in order object

### Items Requiring Stakeholder Input:

- [ ] Confirm success dialog auto-redirect time (3s OK?)
- [ ] Confirm QR code timeout (15 minutes OK?)
- [ ] Approve dialog UI/UX mockups
- [ ] Confirm order status labels (tiếng Việt)
- [ ] Confirm payment status labels (tiếng Việt)

### Research Needed:

- [ ] Check order detail page structure (tồn tại chưa?)
- [ ] Verify order status enum values từ backend
- [ ] Verify payment status enum values từ backend
- [ ] Test polling performance trên mobile network
- [ ] Check localStorage behavior trên different browsers
- [ ] Review shadcn Dialog component API

---

**Status**: ✅ Requirements Complete
**Next Phase**: Design → Architecture & Components
