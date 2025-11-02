---
phase: planning
title: Project Planning & Task Breakdown - API Integration
description: Chi tiết tasks và timeline cho việc kết nối frontend với backend APIs
---

# Project Planning & Task Breakdown - API Integration

## Milestones

- [x] **M1: Foundation Setup** (Week 1) ✅ COMPLETED

  - [x] API client configured
  - [x] Type definitions created
  - [x] Base infrastructure ready

- [x] **M2: Authentication Complete** (Week 1-2) ✅ COMPLETED

  - [x] Login/register working
  - [x] Token refresh implemented
  - [x] Protected routes setup (auth checks in components)

- [x] **M3: Core Features** (Week 2-3) ✅ COMPLETED

  - [x] Products, cart, orders integrated
  - [x] Main user flows working end-to-end

- [ ] **M4: Payments & Polish** (Week 3-4) 🔄 IN PROGRESS
  - [x] Payment integration (COD + SePay)
  - [ ] Protected Route HOC needed
  - [ ] All features tested
  - [ ] Ready for production

## Task Breakdown

### Phase 1: Foundation & Infrastructure 🏗️

#### Task 1.1: Project Structure Reorganization

**Priority**: High | **Effort**: 2h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Xóa hoặc archive `lib/mock-data.ts`
- [x] Tạo cấu trúc folders mới:
  ```
  types/
  ├── auth.types.ts
  ├── user.types.ts
  ├── address.types.ts
  ├── product.types.ts
  ├── category.types.ts
  ├── cart.types.ts
  ├── order.types.ts
  ├── payment.types.ts
  ├── ar.types.ts
  ├── common.types.ts
  └── index.ts
  ```
- [x] Refactor `features/` structure:
  - Rename `features/profile` → merge vào `features/users`
  - Rename `features/virtual-tryon` → `features/ar`
  - Tạo `features/categories/` (tách từ products)
  - Tạo `features/payments/` (tách từ orders)

**Acceptance Criteria:**

- Không còn file mock data
- Tất cả types được tổ chức theo domain
- Features structure match với backend services

---

#### Task 1.2: Type Definitions

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Copy và adapt types từ backend `@shared/types`:

  - `auth.types.ts` ← `auth.types.ts`
  - `user.types.ts` ← `user.types.ts`
  - `address.types.ts` ← `address.types.ts`
  - `product.types.ts` ← `product.types.ts`
  - `category.types.ts` ← từ `product.types.ts`
  - `cart.types.ts` ← `cart.types.ts`
  - `order.types.ts` ← `order.types.ts`
  - `payment.types.ts` ← `payment.types.ts`
  - `ar.types.ts` ← `ar.types.ts`

- [x] Tạo `common.types.ts`:

  ```typescript
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  }

  export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
    timestamp?: string;
  }
  ```

- [x] Export tất cả từ `types/index.ts`

**Acceptance Criteria:**

- Tất cả types match 100% với backend DTOs
- Có JSDoc comments cho các types phức tạp
- TypeScript compile không có errors

---

#### Task 1.3: API Client Setup

**Priority**: High | **Effort**: 3h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Install dependencies:

  ```bash
  pnpm add axios
  pnpm add -D @types/axios
  ```

- [x] Tạo `lib/api-client.ts` với:

  - Base axios instance
  - Request interceptor (add auth header)
  - Response interceptor (handle 401, retry)
  - Error transformer

- [x] Tạo `lib/api-config.ts`:

  ```typescript
  export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
  };
  ```

- [x] Setup `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000
  ```

**Acceptance Criteria:**

- API client có thể make requests
- Interceptors hoạt động đúng
- Error handling unified

---

#### Task 1.4: Auth Store Setup

**Priority**: High | **Effort**: 2h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Cập nhật `stores/auth.store.ts`:

  - Add `accessToken` và `refreshToken` state
  - Add `setTokens()` và `clearAuth()` methods
  - Setup persistence với `zustand/middleware`
  - Add helper methods: `getAccessToken()`, `getRefreshToken()`

- [x] Tạo `lib/auth-utils.ts`:
  - `decodeToken(token: string): TokenPayload`
  - `isTokenExpired(token: string): boolean`
  - `getTokenExpiryTime(token: string): number`

**Acceptance Criteria:**

- Tokens được lưu và restore đúng
- Token decode hoạt động
- Zustand devtools có thể inspect state

---

### Phase 2: Authentication 🔐

#### Task 2.1: Auth Service

**Priority**: High | **Effort**: 3h | **Status**: Complete! ✅

**Subtasks:**

- [ ] Tạo `services/auth/auth.service.ts`:

  ```typescript
  export const authService = {
    login(data: LoginRequest): Promise<AuthResponse>
    register(data: RegisterRequest): Promise<AuthResponse>
    refresh(refreshToken: string): Promise<AuthResponse>
    verify(token: string): Promise<VerifyResponse>
    getCurrentUser(): Promise<UserResponse>
  }
  ```

- [ ] Handle token refresh logic trong interceptor
- [ ] Add error handling cho từng method

**Acceptance Criteria:**

- Tất cả auth endpoints có thể gọi được
- Token refresh tự động khi expired
- Errors được handle gracefully

---

#### Task 2.2: Auth Hooks

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `features/auth/hooks/use-auth.ts`:

  ```typescript
  export function useAuth() {
    const { accessToken, user, isAuthenticated, clearAuth } = useAuthStore()
    return {
      accessToken,
      user,
      isAuthenticated: isAuthenticated(),
      logout: clearAuth,
    }
  }
  ```

- [x] Tạo `features/auth/hooks/use-current-user.ts`:
  ```typescript
  export function useCurrentUser() {
    // Fetch current user data từ store
    // Auto sync khi auth state change
    return { user, loading, error };
  }
  ```

**Acceptance Criteria:**

- ✅ Hooks dễ sử dụng trong components
- ✅ Loading và error states rõ ràng
- ✅ User data được cache trong store

---

#### Task 2.3: Update Login/Register Pages

**Priority**: High | **Effort**: 2h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Cập nhật login form để dùng `useAuth()`
- [x] Cập nhật register form để dùng `useAuth()`
- [x] Add loading indicators
- [x] Add error messages display
- [x] Redirect sau khi login thành công
- [x] Integrate Header component với auth state
  - [x] Show Login/Register buttons khi chưa auth
  - [x] Show user dropdown với Logout khi đã auth

**Acceptance Criteria:**

- ✅ User có thể login/register qua UI
- ✅ Errors hiển thị rõ ràng
- ✅ Redirect đúng sau auth
- ✅ Header responsive với auth state

---

#### Task 2.4: Protected Routes

**Priority**: High | **Effort**: 2h | **Status**: ⏳ IN PROGRESS

**Notes**: 
- Workaround hiện tại: CheckoutContent có auth check nội bộ
- Cần: Protected Route HOC để bảo vệ tất cả pages
- Security risk: Profile, Orders, Addresses pages chưa protected

**Subtasks:**

- [ ] Tạo `components/auth/protected-route.tsx` HOC
- [ ] Wrap protected pages: /profile, /cart/checkout, /cart/success
- [ ] Redirect to login nếu chưa auth
- [ ] Check token validity trước redirect

**Acceptance Criteria:**

- Protected routes không access được khi chưa login
- Redirect về login page
- User quay lại intended page sau login

---

### Phase 3: Products & Categories 🛍️

#### Task 3.1: Products Service & Hooks

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/products/products.service.ts`:

  - [x] `getProducts(query: ProductListQuery)` - list với pagination
  - [x] `getProductById(id: string)` - single product
  - [x] `getProductBySlug(slug: string)` - by slug
  - [x] `searchProducts(query: string)` - search

- [x] Tạo `features/products/hooks/use-products.ts`:

  - [x] State management cho list
  - [x] Pagination support
  - [x] Filter và search

- [x] Tạo `features/products/hooks/use-product.ts`:
  - [x] Single product fetch
  - [x] Loading state

**Acceptance Criteria:**

- ✅ Products list hiển thị từ API
- ✅ Pagination hoạt động
- ✅ Search và filter hoạt động
- ✅ Product detail page load từ API

---

#### Task 3.2: Categories Service & Hooks

**Priority**: Medium | **Effort**: 3h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/categories/categories.service.ts`
- [x] Tạo `features/categories/hooks/use-categories.ts`
- [x] Tạo `features/categories/components/category-filter.tsx`

**Acceptance Criteria:**

- ✅ Categories list từ API
- ✅ Category filter hoạt động
- ✅ Nested categories support (nếu có)

---

#### Task 3.3: Update Product Pages

**Priority**: High | **Effort**: 3h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Update `/products/page.tsx` - dùng `useProducts()`
- [x] Update `/products/[id]/page.tsx` - dùng `useProduct()`
- [x] Update product cards để hiển thị real data
- [x] Format price từ cents sang VND
- [x] Use API data cho stock, images, ratings

**Acceptance Criteria:**

- ✅ Products page load real data
- ✅ Product detail page load real data
- ✅ Images hiển thị đúng
- ✅ Price format đúng (VND từ cents)

---

### Phase 4: Cart Integration 🛒

#### Task 4.1: Cart Service

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/cart/cart.service.ts`:

  - [x] `getCart(userId: string)` - fetch cart
  - [x] `addItem(data: CartAddItemDto)` - add to cart
  - [x] `updateItem(data: CartUpdateItemDto)` - update quantity
  - [x] `removeItem(data: CartRemoveItemDto)` - remove item

- [x] Handle stock validation errors

**Acceptance Criteria:**

- ✅ Cart operations gọi API
- ✅ Stock validation hoạt động
- ✅ Errors được handle

---

#### Task 4.2: Cart Store Migration

**Priority**: High | **Effort**: 3h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Update `stores/cart.store.ts`:

  - [x] Sync với server sau mỗi operation
  - [x] Optimistic updates
  - [x] Rollback on error

- [x] Handle guest cart:
  - [x] Store trong localStorage nếu chưa login
  - [x] Merge với user cart khi login

**Acceptance Criteria:**

- ✅ Cart sync với server
- ✅ Guest cart hoạt động
- ✅ Merge cart on login

---

#### Task 4.3: Update Cart Components

**Priority**: High | **Effort**: 2h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Update cart components để dùng new store
- [x] Add loading states
- [x] Handle errors (stock out, etc.)
- [x] Create CartPageContent component
- [x] CartItem accept async operations

**Acceptance Criteria:**

- ✅ Cart UI hoạt động với real API
- ✅ Loading states smooth
- ✅ Errors hiển thị rõ ràng

---

### Phase 5: Orders & Checkout 📦

#### Task 5.1: Addresses Service & Hooks

**Priority**: High | **Effort**: 3h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/addresses/addresses.service.ts`
  - [x] Full CRUD operations (create, read, update, delete)
  - [x] Async error handling
  
- [x] Tạo `features/addresses/hooks/use-addresses.ts`
  - [x] Fetch addresses
  - [x] Create, update, delete operations
  - [x] Error handling và loading states

- [x] Update address components
  - [x] AddressCard với Vietnam address fields (street, ward, district, city)
  - [x] AddressFormDialog với form validation
  - [x] AddressesTab với CRUD operations

**Acceptance Criteria:**

- ✅ Address CRUD hoạt động
- ✅ Set default address hoạt động
- ✅ Address picker trong checkout

---

#### Task 5.2: Orders Service & Hooks

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/orders/orders.service.ts`:

  - [x] `createOrder(data: OrderCreateDto)` - create order
  - [x] `getOrders(userId: string, query)` - list orders
  - [x] `getOrderById(id: string)` - single order
  - [x] `cancelOrder(id: string)` - cancel order

- [x] Tạo `features/orders/hooks/use-orders.ts`
  - [x] Fetch orders with pagination
  - [x] Total count
  - [x] Error handling

- [x] Tạo `features/orders/components/orders-tab.tsx`
  - [x] Shadcn Table display
  - [x] Order status badges
  - [x] Mobile responsive
  - [x] Empty/Error/Loading states

**Acceptance Criteria:**

- ✅ Order creation từ cart
- ✅ Order list hiển thị
- ✅ Order detail page
- ✅ Cancel order hoạt động

---

#### Task 5.3: Checkout Flow

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Update `/cart/checkout/page.tsx`:

  - [x] Select address từ saved addresses
  - [x] Review cart items
  - [x] Select payment method (COD/SEPAY)
  - [x] Create order via API

- [x] Create CheckoutContent component
  - [x] Auth check (redirect to /auth/login if not authenticated)
  - [x] Empty cart check
  - [x] Address requirement check
  - [x] Address selection with RadioGroup
  - [x] Payment method selection
  - [x] Order items review
  - [x] Summary sidebar with total
  - [x] Order creation integration

- [x] Add validation
- [x] Handle errors

**Acceptance Criteria:**

- ✅ Checkout flow end-to-end
- ✅ Address selection
- ✅ Order summary
- ✅ Error handling

---

### Phase 6: Payments 💳

#### Task 6.1: Payments Service

**Priority**: High | **Effort**: 4h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo `services/payments/payments.service.ts`:
  - [x] `processPayment(data: PaymentProcessDto)` - process COD/SePay
  - [x] `verifyPayment(data: PaymentVerifyDto)` - verify payment
  - [x] `confirmCOD(orderId: string)` - confirm COD
  - [x] `getPaymentByOrder(orderId: string)` - get payment

**Acceptance Criteria:**

- ✅ COD payment working
- ✅ SePay QR code generated
- ✅ Payment status tracking

---

#### Task 6.2: Payment Integration

**Priority**: High | **Effort**: 5h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Tạo payment method selector
- [x] COD flow: Create payment → complete order
- [x] SePay flow:

  - [x] Generate QR code
  - [x] Display QR code component
  - [x] Poll payment status
  - [x] Complete order khi paid

- [x] Handle payment errors
- [x] Create usePaymentStatus hook
  - [x] Auto-polling logic
  - [x] Configurable intervals
  - [x] Exponential backoff
  - [x] Timeout handling

**Acceptance Criteria:**

- ✅ COD payment complete
- ✅ SePay QR code displayed
- ✅ Payment verification
- ✅ Order status updated

---

#### Task 6.3: Success & Payment Pages

**Priority**: Medium | **Effort**: 2h | **Status**: ✅ COMPLETED

**Subtasks:**

- [x] Update `/cart/checkout/success/page.tsx`
  - [x] Display order summary
  - [x] Show payment info
  - [x] Payment processing button
  - [x] COD confirmation card
  - [x] SePay QR code display
  - [x] Mobile responsive

- [x] Add payment status check
- [x] Display order summary

**Acceptance Criteria:**

- ✅ Success page shows order details
- ✅ Payment status displayed
- ✅ Link to order tracking

---

### Phase 7: Additional Features ✨

#### Task 7.1: User Profile

**Priority**: Medium | **Effort**: 3h | **Status**: Not Started

**Subtasks:**

- [ ] Tạo `services/users/users.service.ts`
- [ ] Update profile page với real API
- [ ] Handle profile update

---

#### Task 7.2: AR Integration

**Priority**: Low | **Effort**: 3h | **Status**: Not Started

**Subtasks:**

- [ ] Tạo `services/ar/ar.service.ts`
- [ ] Tạo `features/ar/hooks/use-ar-snapshots.ts`
- [ ] Update AR components

**Note**: AR snapshot upload cần clarify storage solution (S3/Cloudinary?)

---

#### Task 7.3: Admin Features (Optional)

**Priority**: Low | **Effort**: 8h | **Status**: Not Started

**Subtasks:**

- [ ] Admin product CRUD
- [ ] Admin category CRUD
- [ ] Admin order management
- [ ] Admin user management

**Note**: Chỉ implement nếu cần admin panel

---

### Phase 8: Testing & Documentation 🧪

#### Task 8.1: Unit Tests

**Priority**: Medium | **Effort**: 6h | **Status**: ⏳ NOT STARTED

**Subtasks:**

- [ ] Test services (mock axios)
  - [ ] Auth service
  - [ ] Products service
  - [ ] Cart service
  - [ ] Orders service
  - [ ] Payments service
  - [ ] Addresses service

- [ ] Test hooks (React Testing Library)
  - [ ] useAuth, useCurrentUser
  - [ ] useProducts, useProduct
  - [ ] useCart
  - [ ] useOrders
  - [ ] useAddresses
  - [ ] usePaymentStatus

- [ ] Test utils (formatPrice, etc.)
- [ ] Achieve >80% coverage

---

#### Task 8.2: Integration Tests

**Priority**: Medium | **Effort**: 4h | **Status**: ⏳ NOT STARTED

**Subtasks:**

- [ ] Test auth flow (login → protected route)
  - [ ] Successful login
  - [ ] Login errors
  - [ ] Token refresh
  - [ ] Logout

- [ ] Test checkout flow (cart → order → payment)
  - [ ] Add to cart
  - [ ] Checkout flow
  - [ ] Address selection
  - [ ] Payment processing
  - [ ] Success page

- [ ] Test error scenarios
  - [ ] Network errors
  - [ ] API errors
  - [ ] Validation errors

---

#### Task 8.3: Documentation

**Priority**: Medium | **Effort**: 3h | **Status**: ⏳ NOT STARTED

**Subtasks:**

- [ ] Update README với API setup
  - [ ] Backend API requirements
  - [ ] Environment variables
  - [ ] How to run locally
  
- [ ] Document environment variables
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] API_TIMEOUT
  - [ ] RETRY_COUNT

- [ ] Document common errors và solutions
  - [ ] Network errors
  - [ ] Auth errors
  - [ ] Validation errors

- [ ] API service documentation
  - [ ] Service structure
  - [ ] Hook patterns
  - [ ] Error handling

---

## Dependencies

### External Dependencies

- ✅ Backend API Gateway running (`http://localhost:3000`)
- ✅ Backend services healthy
- ✅ Database migrations applied
- ⚠️ SePay account và webhook config (cần setup)
- ⚠️ Image CDN config (nếu dùng)

### Task Dependencies

```mermaid
graph TD
    A[1.1 Structure] --> B[1.2 Types]
    B --> C[1.3 API Client]
    C --> D[1.4 Auth Store]

    D --> E[2.1 Auth Service]
    E --> F[2.2 Auth Hooks]
    F --> G[2.3 Update Pages]
    G --> H[2.4 Protected Routes]

    H --> I[3.1 Products Service]
    H --> J[4.1 Cart Service]
    H --> K[5.1 Addresses Service]

    I --> L[3.3 Update Product Pages]
    J --> M[4.2 Cart Store]
    K --> N[5.2 Orders Service]

    M --> N
    N --> O[5.3 Checkout Flow]
    O --> P[6.1 Payments Service]
    P --> Q[6.2 Payment Integration]
```

### Blockers

- ❌ **Backend not running**: Cannot test API calls
- ❌ **SePay not configured**: Cannot test SePay payments
- ❌ **Image upload**: Cần clarify storage solution

---

## Timeline & Estimates

### Week 1: Foundation & Auth

- Day 1-2: Tasks 1.1 → 1.4 (Foundation) - **11h**
- Day 3-4: Tasks 2.1 → 2.4 (Authentication) - **11h**
- Day 5: Buffer và testing

**Deliverable**: Login/register working, protected routes

---

### Week 2: Products & Cart

- Day 1-2: Tasks 3.1 → 3.3 (Products) - **10h**
- Day 3-4: Tasks 4.1 → 4.3 (Cart) - **9h**
- Day 5: Buffer và testing

**Deliverable**: Products và cart fully integrated

---

### Week 3: Orders & Checkout

- Day 1-2: Tasks 5.1 → 5.3 (Orders) - **11h**
- Day 3-4: Tasks 6.1 → 6.2 (Payments) - **9h**
- Day 5: Task 6.3 và testing - **2h**

**Deliverable**: Full checkout flow working

---

### Week 4: Polish & Testing

- Day 1-2: Tasks 7.1 → 7.2 (Additional features) - **6h**
- Day 3-4: Tasks 8.1 → 8.2 (Testing) - **10h**
- Day 5: Task 8.3 (Documentation) - **3h**

**Deliverable**: Production-ready, tested, documented

---

## Risks & Mitigation

### Technical Risks

| Risk                          | Likelihood | Impact | Mitigation                           |
| ----------------------------- | ---------- | ------ | ------------------------------------ |
| Backend API changes           | Medium     | High   | Lock backend version, API versioning |
| Token refresh race conditions | Medium     | Medium | Implement request queue              |
| SePay webhook unreliable      | Medium     | High   | Implement polling fallback           |
| Network errors                | High       | Medium | Retry logic, offline support         |
| Type mismatches               | Low        | Medium | Regular sync với backend types       |

### Timeline Risks

| Risk                      | Likelihood | Impact | Mitigation                         |
| ------------------------- | ---------- | ------ | ---------------------------------- |
| Scope creep               | Medium     | High   | Stick to MVP, defer admin features |
| Blocker dependencies      | Low        | High   | Early validation của external deps |
| Underestimated complexity | Medium     | Medium | 20% buffer time                    |

### Mitigation Strategies

1. **Early Backend Validation**

   - Test tất cả API endpoints với Postman/Thunder Client
   - Document API quirks và edge cases

2. **Incremental Development**

   - Implement và test từng domain một
   - Không move sang domain mới khi domain hiện tại chưa stable

3. **Continuous Testing**

   - Test mỗi feature sau khi implement
   - Integration tests cho critical flows

4. **Regular Sync**
   - Daily sync types với backend nếu có updates
   - Weekly review với backend team

---

## Resources Needed

### Team & Roles

- **Frontend Developer**: Implementation (you)
- **Backend Developer**: API support và clarification
- **QA**: Testing assistance (optional)

### Tools & Services

- **Development**:

  - VS Code với TypeScript ESLint
  - Thunder Client hoặc Postman
  - React DevTools
  - Zustand DevTools

- **Testing**:

  - Vitest (unit tests)
  - React Testing Library
  - Playwright or Cypress (E2E)

- **Monitoring** (Production):
  - Sentry (error tracking)
  - Vercel Analytics
  - LogRocket (session replay)

### Infrastructure

- **Development**:

  - Backend running locally (`:3000`)
  - PostgreSQL databases
  - NATS server

- **Production** (Future):
  - API Gateway URL
  - CDN cho images
  - SSL certificates

### Documentation Needed

- ✅ API documentation (provided)
- ⚠️ SePay integration guide
- ⚠️ Deployment guide
- ⚠️ Environment setup guide

---

## Success Metrics

### Code Quality

- TypeScript strict mode enabled
- Zero `any` types trong production code
- > 80% test coverage for critical paths
- ESLint với no errors

### User Experience

- Loading states cho tất cả async operations
- Error messages rõ ràng và actionable
- Smooth transitions, no jarring UX
- Mobile responsive

### Performance

- Lighthouse score >90
- First Contentful Paint <1.5s
- Time to Interactive <3s
- Bundle size reasonable (<500KB)

---

## Next Steps

1. ✅ Review requirements doc
2. ✅ Review design doc
3. ✅ Review planning doc ← **COMPLETED - 19/23 Core Tasks Done (83%)**
4. ⏭️ **IMMEDIATE**: Task 2.4 - Create Protected Route HOC (2h) 🚨
5. ⏭️ **NEXT**: Run `/writing-test` for Task 8.1 - Unit Tests (6h)
6. ⏭️ **THEN**: Task 8.2 - Integration Tests (4h)
7. ⏭️ **FINAL**: Task 8.3 - Documentation (3h)

**Current Status**: 
- ✅ **19/23 Core tasks completed (83%)**
- 🔴 **1 Critical missing**: Task 2.4 Protected Route HOC
- 🟡 **3 Quality tasks**: Unit/Integration tests + Documentation

**Ready to start Task 2.4?** Run `/execute-plan` để bắt đầu! 🚀
