---
phase: requirements
title: VIP Customer Management & Promotions - Frontend Requirements
description: UI/UX cho khách hàng VIP, hiển thị discounts, và admin management
---

# Requirements & Problem Understanding - Frontend

## Problem Statement

**What problem are we solving?**

- **Vấn đề**: Khách hàng không thấy được status VIP và lợi ích của việc chi tiêu nhiều
- **Ai bị ảnh hưởng**:
  - Khách hàng không có motivation để tăng chi tiêu
  - Admin không có UI để quản lý VIP tiers và discount codes
  - Checkout flow thiếu chức năng áp dụng mã giảm giá
- **Tình trạng hiện tại**: UI không hỗ trợ hiển thị VIP status hoặc apply discount codes

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals

1. **Hiển thị VIP badge và tier** trên profile khách hàng
2. **UI để apply discount codes** trong checkout
3. **Admin dashboard** để quản lý VIP tiers và discount codes
4. **Responsive UI** cho mobile và desktop

### Secondary Goals

- Animated transitions khi apply discount
- Real-time validation cho discount codes
- Toast notifications cho tier changes
- Beautiful VIP tier progress bar

### Non-goals (Out of Scope - Phase 1)

- Gamification UI (progress bars phức tạp)
- VIP tier comparison page
- Social sharing của VIP status
- Customizable VIP badge colors

## User Stories & Use Cases

### User Story 1: Khách hàng xem VIP status

**As a** logged-in customer  
**I want to** see my VIP tier on my profile  
**So that** I know what benefits I have

**Acceptance Criteria**:

- ✓ VIP badge hiển thị trên header khi logged in
- ✓ Profile page có section chi tiết về VIP tier
- ✓ Hiển thị current tier, discount rate, spending progress
- ✓ Mobile-responsive design

### User Story 2: Khách hàng áp dụng mã giảm giá

**As a** customer in checkout  
**I want to** enter a discount code  
**So that** I can reduce my total amount

**Acceptance Criteria**:

- ✓ Input field với button "Apply" trong checkout
- ✓ Real-time validation với loading state
- ✓ Success message hiển thị số tiền giảm
- ✓ Error message nếu mã không hợp lệ
- ✓ Remove code button nếu đã apply

### User Story 3: Admin quản lý discount codes

**As an** admin  
**I want to** create and edit discount codes  
**So that** I can run VIP promotions

**Acceptance Criteria**:

- ✓ Admin page `/admin/promotions` với danh sách codes
- ✓ Form tạo code mới với validation
- ✓ Edit modal cho codes hiện có
- ✓ Toggle active/inactive status
- ✓ Search và filter codes

### User Story 4: Admin quản lý VIP tiers

**As an** admin  
**I want to** manually adjust customer VIP tiers  
**So that** I can reward special customers

**Acceptance Criteria**:

- ✓ Admin page `/admin/customers` với VIP column
- ✓ Modal để thay đổi tier
- ✓ Reason input field (required)
- ✓ Confirmation dialog trước khi lưu
- ✓ Audit log hiển thị lịch sử thay đổi

## Success Criteria

**How will we know when we're done?**

### Measurable Outcomes

1. **User Engagement**: 80% VIP customers view their tier info trong 7 ngày đầu
2. **Discount Usage**: 50% checkout sessions có attempt apply code
3. **Admin Efficiency**: Admin tạo discount code trong < 2 phút
4. **Performance**: Tất cả VIP UI components load < 500ms

### Technical Acceptance Criteria

- [ ] `/profile` page hiển thị VIP status component
- [ ] Checkout page có discount code input
- [ ] `/admin/promotions` CRUD interface
- [ ] `/admin/customers` VIP management interface
- [ ] Responsive design cho mobile (375px+)
- [ ] Accessibility: keyboard navigation, ARIA labels
- [ ] TypeScript: 100% type-safe, no `any`
- [ ] Tests: ≥ 85% coverage cho VIP components

### UX Benchmarks

- Form validation < 200ms
- Discount apply feedback < 500ms
- Page transitions smooth (60fps)

## UI/UX Requirements

### 1. VIP Badge Component

**Location**: Header, Profile

```tsx
<VIPBadge tier="GOLD" className="ml-2" />
// Output: 🏆 Gold (icon + text)
```

**Design**:

- Bronze: 🥉 + màu #CD7F32
- Silver: 🥈 + màu #C0C0C0
- Gold: 🥇 + màu #FFD700
- Platinum: 💎 + màu #E5E4E2

### 2. Discount Code Input (Checkout)

**Location**: `/checkout` page

**Features**:

- Input field với placeholder "Nhập mã giảm giá"
- "Áp dụng" button
- Loading spinner khi validate
- Success: "Giảm 100,000₫ với mã GOLD10"
- Error: "Mã không hợp lệ hoặc đã hết hạn"

### 3. Admin Discount Code Manager

**Location**: `/admin/promotions`

**Features**:

- Data table với columns: Code, Type, Value, Tier, Expiry, Status
- Search bar
- Filter by tier, status
- "Tạo mã mới" button → Modal
- Edit icon → Modal
- Toggle switch cho active/inactive

### 4. Admin VIP Tier Manager

**Location**: `/admin/customers`

**Features**:

- Customer list với VIP tier column
- "Thay đổi tier" action → Modal
- Modal có:
  - Dropdown chọn tier mới
  - Textarea cho reason
  - Confirm button

## Constraints & Assumptions

### Technical Constraints

- Frontend: Next.js 14 App Router
- UI Library: shadcn/ui components
- Forms: react-hook-form + zod validation
- State: React Query cho API calls
- Auth: Existing JWT system

### Design Constraints

- Phải follow existing design system
- Sử dụng shadcn/ui Badge, Card, Dialog components
- Colors phải accessible (WCAG AA)

### Assumptions

1. Backend API endpoints sẵn sàng trước khi FE bắt đầu
2. Discount codes không case-sensitive
3. VIP tier thay đổi real-time (không cần refresh)
4. Admin có role `ADMIN` hoặc `SUPER_ADMIN`

## Questions & Open Items

### Unresolved Questions

1. **Q**: Có cần hiển thị progress bar tới tier tiếp theo không?  
   **A**: Phase 2 - có thể thêm visual progress indicator

2. **Q**: Discount code có thể combine với coupon khác không?  
   **A**: Phase 1 - không. Chỉ 1 code/order

3. **Q**: Admin có thể bulk upload discount codes không?  
   **A**: Phase 2 - bulk operations

4. **Q**: Có cần notification center cho tier changes không?  
   **A**: Phase 1 - toast notification. Phase 2 - notification center

### Items Requiring Stakeholder Input

- [ ] Finalize VIP badge design (icons/colors)
- [ ] Confirm copy text cho success/error messages
- [ ] Email notification design (nếu FE cần render preview)

### Research Needed

- [ ] Best UX patterns cho discount code input
- [ ] Accessibility testing cho VIP badge contrast
- [ ] Mobile UX cho admin discount management
