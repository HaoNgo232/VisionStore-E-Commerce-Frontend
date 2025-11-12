# Review Code Frontend - Tính Năng Đã Triển Khai & Flow Hoạt Động

## Mục tiêu

- Liệt kê đầy đủ các tính năng đã triển khai trong frontend
- Xác định các tính năng chưa hoàn thiện hoặc thiếu sót
- Trình bày flow hoạt động chi tiết từ client đến backend cho từng tính năng

## Phạm vi Review

### 1. Các Features Đã Triển Khai

#### 1.1 Authentication (Đã hoàn thiện)

**Frontend Files:**

- `features/auth/services/auth.service.ts` - Auth API service
- `features/auth/hooks/use-auth.ts` - Auth state management hook
- `features/auth/components/login-form.tsx` - Login UI
- `features/auth/components/register-form.tsx` - Register UI
- `app/auth/login/page.tsx` - Login page
- `app/auth/register/page.tsx` - Register page

**Backend Endpoints:**

- `POST /auth/login` - Login với email/password
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Lấy thông tin user hiện tại
- `POST /auth/verify` - Verify JWT token

**Flow:**

1. User nhập credentials → `LoginForm` component
2. `useAuth` hook gọi `authService.login()`
3. Frontend gửi POST `/auth/login` với credentials
4. Gateway (`auth.controller.ts`) forward đến USER_SERVICE qua NATS event `AUTH.LOGIN`
5. User-service xác thực và trả về `AuthResponse` (accessToken, refreshToken)
6. Frontend lưu tokens vào `authStore` (Zustand)
7. Token được tự động attach vào headers qua axios interceptor
8. Redirect user đến trang chủ hoặc trang đích

#### 1.2 Products Management (Đã hoàn thiện)

**Frontend Files:**

- `features/products/services/products.service.ts` - Products API service
- `features/products/hooks/use-products.ts` - Products query hook
- `features/products/components/product-card.tsx` - Product card UI
- `features/products/components/product-detail-content.tsx` - Product detail UI
- `features/products/components/product-filters.tsx` - Filter UI
- `app/(shop)/products/page.tsx` - Products listing page
- `app/(shop)/products/[slug]/page.tsx` - Product detail page
- `app/admin/products/page.tsx` - Admin products list
- `app/admin/products/new/page.tsx` - Create product page
- `app/admin/products/[id]/edit/page.tsx` - Edit product page

**Backend Endpoints:**

- `GET /products` - List products với filters (page, pageSize, categorySlug, search, minPriceInt, maxPriceInt)
- `GET /products/:id` - Get product by ID
- `GET /products/slug/:slug` - Get product by slug
- `POST /products` - Create product (admin only)
- `PATCH /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)
- `POST /products/admin` - Create product with image upload (admin only)
- `PUT /products/admin/:id` - Update product with image upload (admin only)
- `DELETE /products/admin/:id` - Delete product and image (admin only)

**Flow:**

1. User truy cập `/products` → `ProductsPage` component
2. `useProducts` hook gọi `productsApi.getAll()` với query params
3. Frontend gửi GET `/products?page=1&pageSize=12&categorySlug=...`
4. Gateway (`products.controller.ts`) forward đến PRODUCT_SERVICE qua NATS event `PRODUCT.LIST`
5. Product-service query database và trả về `PaginatedProductsResponse`
6. Frontend render products grid với pagination
7. User click product → navigate đến `/products/[slug]`
8. `useProductDetail` hook gọi `productsApi.getBySlug(slug)`
9. Frontend gửi GET `/products/slug/:slug`
10. Gateway forward đến PRODUCT_SERVICE event `PRODUCT.GET_BY_SLUG`
11. Product-service trả về product detail với images, category, etc.
12. Frontend render product detail page

#### 1.3 Shopping Cart (Đã hoàn thiện)

**Frontend Files:**

- `features/cart/services/cart.service.ts` - Cart API service
- `features/cart/hooks/use-cart.ts` - Cart state management hook
- `features/cart/components/cart-page-content.tsx` - Cart page UI
- `features/cart/components/cart-item.tsx` - Cart item UI
- `features/cart/components/cart-summary.tsx` - Cart summary UI
- `app/(shop)/cart/page.tsx` - Cart page
- `stores/cart.store.ts` - Cart Zustand store

**Backend Endpoints:**

- `GET /cart` - Get user's cart với products details
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items` - Update item quantity
- `DELETE /cart/items` - Remove item from cart
- `DELETE /cart` - Clear entire cart

**Flow:**

1. User click "Add to Cart" → `useCart` hook gọi `cartApi.addItem()`
2. Frontend gửi POST `/cart/items` với `{ productId, quantity, userId }`
3. Gateway (`cart.controller.ts`) extract userId từ JWT token, forward đến CART_SERVICE qua NATS event `CART.ADD_ITEM`
4. Cart-service tạo/update cart item trong database
5. Cart-service query products để enrich cart items với product details
6. Trả về `CartWithProductsResponse` (cart + items với product info + totalInt)
7. Frontend update cart store và UI
8. Cart badge hiển thị số lượng items

#### 1.4 Checkout & Orders (Đã hoàn thiện)

**Frontend Files:**

- `features/checkout/services/checkout.service.ts` - Checkout business logic
- `features/checkout/hooks/use-checkout.ts` - Checkout state management
- `features/checkout/components/checkout-content.tsx` - Checkout page UI
- `features/checkout/components/address-selector.tsx` - Address selection UI
- `features/checkout/components/payment-method-selector.tsx` - Payment method UI
- `features/checkout/components/order-summary.tsx` - Order summary UI
- `features/orders/services/orders.service.ts` - Orders API service
- `features/orders/hooks/use-orders.ts` - Orders query hook
- `features/orders/components/orders-tab.tsx` - Orders list UI
- `features/orders/components/order-detail-view.tsx` - Order detail UI
- `app/(shop)/cart/checkout/page.tsx` - Checkout page
- `app/(shop)/cart/success/page.tsx` - Order success page
- `app/(account)/orders/[id]/page.tsx` - Order detail page
- `app/admin/orders/page.tsx` - Admin orders list
- `app/admin/orders/[id]/page.tsx` - Admin order detail

**Backend Endpoints:**

- `POST /orders` - Create order từ cart
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order by ID
- `GET /orders/admin/all` - List all orders (admin only) với filters
- `PATCH /orders/:id/status` - Update order status (admin only)
- `PATCH /orders/:id/cancel` - Cancel order

**Flow Checkout COD:**

1. User click "Thanh toán" → `CheckoutContent` component
2. User chọn address và payment method (COD)
3. `useCheckout` hook gọi `checkoutService.processCodCheckout()`
4. Service gọi `ordersApi.create()` với `{ addressId, items, userId }`
5. Frontend gửi POST `/orders`
6. Gateway (`orders.controller.ts`) forward đến ORDER_SERVICE qua NATS event `ORDER.CREATE`
7. Order-service tạo order với status `PENDING`, payment status `UNPAID`
8. Trả về order với orderId
9. Frontend clear cart, redirect đến `/cart/success?orderId=...`

**Flow Checkout SePay:**

1. User chọn payment method SePay
2. `checkoutService.processSepayCheckout()` gọi:
   - `ordersApi.create()` → tạo order
   - `paymentsApi.process()` → tạo payment và QR code
3. Frontend gửi POST `/payments/process` với `{ orderId, method: SEPAY, amountInt }`
4. Gateway (`payments.controller.ts`) forward đến PAYMENT_SERVICE qua NATS event `PAYMENT.PROCESS`
5. Payment-service tạo payment record, gọi SePay API để lấy QR code
6. Trả về `PaymentProcessResponse` với `paymentId` và `qrCode`
7. Frontend mở `PaymentWaitingDialog` với QR code
8. `usePaymentPolling` hook polling payment status mỗi 3 giây
9. Khi payment status = `PAID`, frontend redirect đến success page

#### 1.5 Payments (Đã hoàn thiện)

**Frontend Files:**

- `features/payments/services/payments.service.ts` - Payments API service
- `features/payments/hooks/use-payment-polling.ts` - Payment status polling hook
- `features/payments/hooks/use-payment-status.ts` - Payment status query hook
- `features/payments/components/payment-waiting-dialog.tsx` - Payment waiting UI với QR code
- `features/payments/components/payment-status-badge.tsx` - Payment status badge
- `features/payments/components/sepay-qr-display.tsx` - SePay QR code display

**Backend Endpoints:**

- `POST /payments/process` - Process payment (COD hoặc SePay)
- `GET /payments/order/:orderId` - Get payment by order ID
- `GET /payments/:id` - Get payment by ID
- `POST /payments/confirm-cod/:orderId` - Confirm COD payment (admin only)
- `POST /payments/webhook/sepay` - SePay webhook endpoint

**Flow Payment Polling:**

1. Sau khi tạo payment với SePay, frontend mở `PaymentWaitingDialog`
2. `usePaymentPolling` hook bắt đầu polling mỗi 3 giây
3. Hook gọi `paymentsApi.getByOrder(orderId)`
4. Frontend gửi GET `/payments/order/:orderId`
5. Gateway forward đến PAYMENT_SERVICE event `PAYMENT.GET_BY_ORDER`
6. Payment-service query payment status từ database
7. Nếu status = `PAID` (đã được SePay webhook update), trả về payment
8. Frontend detect status change, gọi `handlePaymentSuccess()`
9. Clear cart, redirect đến success page

#### 1.6 Addresses Management (Đã hoàn thiện)

**Frontend Files:**

- `features/addresses/services/addresses.service.ts` - Addresses API service
- `features/addresses/hooks/use-addresses.ts` - Addresses query hook
- `features/addresses/components/addresses-tab.tsx` - Addresses list UI
- `features/addresses/components/address-form-dialog.tsx` - Address form UI
- `app/(account)/profile/page.tsx` - Profile page với addresses tab

**Backend Endpoints:**

- `GET /addresses` - List user's addresses
- `GET /addresses/:id` - Get address by ID
- `POST /addresses` - Create address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address
- `PATCH /addresses/:id/default` - Set default address

**Flow:**

1. User truy cập `/profile?tab=addresses` → `ProfilePage` component
2. `useAddresses` hook gọi `addressesApi.getAll()`
3. Frontend gửi GET `/addresses`
4. Gateway (`addresses.controller.ts`) extract userId từ JWT, forward đến USER_SERVICE qua NATS event `ADDRESS.LIST_BY_USER`
5. User-service query addresses của user từ database
6. Trả về `AddressResponse[]`
7. Frontend render addresses list với default badge
8. User click "Thêm địa chỉ" → mở `AddressFormDialog`
9. User submit form → `addressesApi.create()` với address data
10. Frontend gửi POST `/addresses`
11. Gateway forward đến USER_SERVICE event `ADDRESS.CREATE`
12. User-service tạo address, set default nếu là address đầu tiên
13. Frontend refresh addresses list

#### 1.7 User Profile & Management (Đã hoàn thiện)

**Frontend Files:**

- `features/users/services/users.service.ts` - Users API service (admin)
- `features/users/hooks/use-user-profile.ts` - User profile hook
- `features/users/hooks/use-update-profile.ts` - Update profile hook
- `features/users/components/profile-tab.tsx` - Profile form UI
- `features/users/components/users-list-table.tsx` - Admin users list UI
- `features/users/components/user-edit-form-dialog.tsx` - Admin user edit UI
- `app/(account)/profile/page.tsx` - User profile page
- `app/admin/users/page.tsx` - Admin users list
- `app/admin/users/[id]/page.tsx` - Admin user detail

**Backend Endpoints:**

- `GET /users` - List users với filters (admin only)
- `GET /users/:id` - Get user by ID
- `GET /users/email/:email` - Get user by email (admin only)
- `PUT /users/:id` - Update user
- `PUT /users/:id/deactivate` - Deactivate user (admin only)

**Flow:**

1. User truy cập `/profile` → `ProfilePage` component
2. `useUserProfile` hook gọi `authService.getCurrentUser()`
3. Frontend gửi GET `/auth/me`
4. Gateway (`auth.controller.ts`) verify JWT token, extract userId
5. Gateway forward đến USER_SERVICE event `USER.FIND_BY_ID`
6. User-service query user từ database
7. Trả về `UserResponse` với profile info
8. Frontend render profile form với user data
9. User update profile → `useUpdateProfile` hook gọi `usersApi.updateProfile()`
10. Frontend gửi PUT `/users/:id` với updated data
11. Gateway forward đến USER_SERVICE event `USER.UPDATE`
12. User-service update user trong database
13. Frontend refresh user profile

#### 1.8 Categories (Đã hoàn thiện)

**Frontend Files:**

- `features/categories/services/categories.service.ts` - Categories API service
- `features/categories/hooks/use-categories.ts` - Categories query hook
- `components/sections/categories-section.tsx` - Categories display UI

**Backend Endpoints:**

- `GET /categories` - List categories với pagination
- `GET /categories/:id` - Get category by ID
- `GET /categories/slug/:slug` - Get category by slug
- `POST /categories` - Create category (admin only)
- `PATCH /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Delete category (admin only)

**Flow:**

1. Homepage load → `CategoriesSection` component
2. `useCategories` hook gọi `categoriesApi.getAll()`
3. Frontend gửi GET `/categories`
4. Gateway (`categories.controller.ts`) forward đến PRODUCT_SERVICE qua NATS event `CATEGORY.LIST`
5. Product-service query categories từ database
6. Trả về `PaginatedCategoriesResponse`
7. Frontend render categories grid
8. User click category → filter products by categorySlug

#### 1.9 AR (Augmented Reality) - Virtual Try-On (Đã triển khai cơ bản)

**Frontend Files:**

- `features/ar/services/ar.service.ts` - AR API service
- `features/ar/hooks/use-ar-snapshots.ts` - AR snapshots hook
- `features/ar/components/virtual-tryon-dialog.tsx` - Virtual try-on UI
- `app/(public)/try-on/` - Try-on page

**Backend Endpoints:**

- `POST /ar/snapshots` - Create AR snapshot (user chụp ảnh với AR)
- `GET /ar/snapshots` - List AR snapshots với pagination

**Flow:**

1. User mở product detail → click "Thử kính ảo"
2. `VirtualTryOnDialog` component mở với AR view
3. User chụp ảnh với AR → `arApi.upload()` với image và productId
4. Frontend gửi POST `/ar/snapshots` với FormData (image file + productId)
5. Gateway (`ar.controller.ts`) forward đến AR_SERVICE qua NATS event `AR.SNAPSHOT_CREATE`
6. AR-service lưu snapshot image và metadata
7. Trả về `ARSnapshotCreateResponse` với snapshotId
8. Frontend hiển thị snapshot trong dialog

### 2. Các Tính Năng Chưa Hoàn Thiện Hoặc Thiếu Sót

#### 2.1 Categories Management (Admin) - CHƯA CÓ UI

**Status:** Backend đã có endpoints, frontend chưa có admin UI

**Missing:**

- Admin categories list page (`app/admin/categories/page.tsx`)
- Admin category form component (`features/categories/components/admin-category-form.tsx`)
- Admin category CRUD hooks (`features/categories/hooks/use-admin-categories.ts`)

**Backend Support:** ✅ Đã có đầy đủ endpoints

#### 2.2 AR Snapshots List & Gallery - CHƯA CÓ UI

**Status:** Backend đã có endpoint list snapshots, frontend chưa có UI hiển thị

**Missing:**

- AR snapshots gallery page (`app/(public)/ar-gallery/page.tsx`)
- AR snapshot card component (`features/ar/components/ar-snapshot-card.tsx`)
- AR snapshots list hook với pagination

**Backend Support:** ✅ Đã có endpoint `GET /ar/snapshots`

#### 2.3 Payment Webhook Handling - CHƯA CÓ FRONTEND INTEGRATION

**Status:** Backend đã có webhook endpoint, frontend chưa có real-time update

**Missing:**

- WebSocket hoặc Server-Sent Events để nhận payment status updates real-time
- Hiện tại chỉ dùng polling (mỗi 3 giây) - không optimal

**Backend Support:** ✅ Đã có `POST /payments/webhook/sepay`

#### 2.4 Order Status Updates Real-time - CHƯA CÓ

**Status:** Frontend chỉ refresh khi user reload page

**Missing:**

- Real-time order status updates (WebSocket/SSE)
- Push notifications khi order status thay đổi

**Backend Support:** ⚠️ Cần thêm event emitter cho order status changes

#### 2.5 Product Reviews & Ratings - CHƯA CÓ

**Status:** Hoàn toàn chưa triển khai

**Missing:**

- Reviews API service
- Reviews components (review list, review form, rating display)
- Reviews hooks
- Reviews pages

**Backend Support:** ❌ Chưa có endpoints

#### 2.6 Wishlist/Favorites - CHƯA CÓ

**Status:** Hoàn toàn chưa triển khai

**Missing:**

- Wishlist API service
- Wishlist components
- Wishlist hooks
- Wishlist page

**Backend Support:** ❌ Chưa có endpoints

#### 2.7 Search Functionality - CHƯA CÓ ADVANCED SEARCH

**Status:** Có basic search trong products list, chưa có search page riêng

**Missing:**

- Dedicated search page (`app/(shop)/search/page.tsx`)
- Search suggestions/autocomplete
- Search filters sidebar
- Search history

**Backend Support:** ✅ Products endpoint đã hỗ trợ search query param

#### 2.8 Reports/Analytics (Admin) - CHƯA CÓ FRONTEND

**Status:** Backend có report-app, frontend chưa có UI

**Missing:**

- Admin reports dashboard (`app/admin/reports/page.tsx`)
- Reports API service
- Charts và visualizations (sales, orders, products, etc.)

**Backend Support:** ✅ Có report-app microservice

### 3. Flow Hoạt Động Tổng Quan

#### 3.1 Architecture Pattern

- **Frontend:** Next.js 14 App Router với React Server Components
- **State Management:** Zustand stores + React Query cho server state
- **API Communication:** Axios với interceptors cho auth token
- **Backend:** Microservices architecture với NATS messaging
- **Gateway:** NestJS API Gateway làm entry point, forward requests đến microservices

#### 3.2 Request Flow Pattern

```
Client (Browser)
  ↓
Next.js Frontend (React Components)
  ↓
API Service Layer (features/*/services/*.service.ts)
  ↓
API Client (lib/api-client.ts) với axios interceptors
  ↓
HTTP Request với Bearer Token
  ↓
Backend Gateway (apps/gateway/src)
  ↓
Auth Guard (verify JWT token)
  ↓
Controller (extract params, build DTO)
  ↓
NATS Message Bus
  ↓
Microservice (order-app, cart-app, product-app, etc.)
  ↓
Database (Prisma ORM)
  ↓
Response qua NATS
  ↓
Gateway Controller
  ↓
HTTP Response
  ↓
Frontend API Client
  ↓
Zod Schema Validation
  ↓
React Component Update
```

#### 3.3 Authentication Flow

1. User login → Frontend gửi credentials
2. Gateway forward đến USER_SERVICE
3. User-service verify credentials, generate JWT tokens
4. Frontend lưu tokens vào Zustand store
5. Axios interceptor tự động attach token vào headers
6. Token refresh tự động khi 401 response

#### 3.4 Error Handling Flow

1. API error → Axios interceptor catch
2. Transform error message từ NestJS format
3. Show toast notification (Sonner)
4. Log error để debugging
5. Retry logic cho network errors

## Kết Luận

### Tính Năng Đã Hoàn Thiện (9/9 core features)

1. ✅ Authentication (Login, Register, Token Refresh)
2. ✅ Products Management (List, Detail, Admin CRUD)
3. ✅ Shopping Cart (Add, Update, Remove, Clear)
4. ✅ Checkout & Orders (COD, SePay, Order Management)
5. ✅ Payments (Process, Polling, Status Check)
6. ✅ Addresses Management (CRUD, Set Default)
7. ✅ User Profile & Management (Profile, Admin Users)
8. ✅ Categories (List, Display)
9. ✅ AR Virtual Try-On (Basic snapshot upload)

### Tính Năng Chưa Hoàn Thiện (8 features)

1. ⚠️ Categories Management (Admin UI)
2. ⚠️ AR Snapshots Gallery
3. ⚠️ Real-time Payment Updates
4. ⚠️ Real-time Order Status Updates
5. ❌ Product Reviews & Ratings
6. ❌ Wishlist/Favorites
7. ⚠️ Advanced Search Page
8. ❌ Reports/Analytics Dashboard

### Recommendations

1. **Priority 1:** Hoàn thiện Categories Management admin UI
2. **Priority 2:** Implement real-time updates cho payments và orders (WebSocket/SSE)
3. **Priority 3:** Thêm Product Reviews & Ratings feature
4. **Priority 4:** Implement Wishlist/Favorites
5. **Priority 5:** Tạo Reports Dashboard cho admin

## Chi Tiết Kỹ Thuật

### API Client Architecture

**File:** `lib/api-client.ts`

- Axios instance với base URL từ environment variable
- Request interceptor: Tự động attach Bearer token từ auth store
- Response interceptor: Handle 401 errors, tự động refresh token
- Validated request helpers: `apiGetValidated`, `apiPostValidated`, etc. với Zod schema validation

### State Management Pattern

**Zustand Stores:**
- `stores/auth.store.ts` - Auth tokens và user state
- `stores/cart.store.ts` - Cart state (có thể deprecated, đang dùng React Query)

**React Query:**
- Server state được quản lý qua React Query hooks
- Query keys được tổ chức theo feature trong `lib/query-keys.ts`
- Automatic refetch và caching

### Type Safety

- Tất cả API responses được validate bằng Zod schemas
- Types được infer từ Zod schemas
- Không sử dụng `any` types
- Strict TypeScript config

### Error Handling

- Centralized error handling trong `api-client.ts`
- Transform NestJS validation errors (có thể là string hoặc string[])
- Toast notifications cho user feedback
- Error logging cho debugging

## File Structure Reference

### Frontend Structure

```
frontend-luan-van/
├── app/                          # Next.js App Router
│   ├── (account)/               # Account routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   └── orders/
│   ├── (shop)/                  # Shop routes
│   │   ├── products/
│   │   ├── cart/
│   │   └── contact/
│   ├── admin/                   # Admin routes
│   │   ├── products/
│   │   ├── orders/
│   │   └── users/
│   └── auth/                    # Auth routes
├── features/                     # Feature modules
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── addresses/
│   ├── users/
│   ├── categories/
│   └── ar/
├── components/                   # Shared components
│   ├── layout/
│   ├── sections/
│   ├── skeletons/
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utilities
│   ├── api-client.ts
│   ├── query-keys.ts
│   └── validation-utils.ts
├── stores/                      # Zustand stores
├── types/                       # TypeScript types
└── public/                      # Static assets
```

### Backend Structure

```
backend-luan-van/
├── apps/
│   ├── gateway/                 # API Gateway
│   │   └── src/
│   │       ├── auth/
│   │       ├── products/
│   │       ├── cart/
│   │       ├── orders/
│   │       ├── payments/
│   │       ├── addresses/
│   │       ├── users/
│   │       ├── ar/
│   │       └── categories/
│   ├── product-app/             # Product microservice
│   ├── cart-app/                # Cart microservice
│   ├── order-app/               # Order microservice
│   ├── payment-app/             # Payment microservice
│   ├── user-app/                # User microservice
│   ├── ar-app/                  # AR microservice
│   └── report-app/              # Report microservice
└── libs/
    └── shared/                  # Shared libraries
        ├── dto/                 # DTOs
        ├── types/               # Types
        └── events.ts            # NATS events
```

## Notes

- Tất cả API calls đều đi qua Gateway, không có direct calls đến microservices
- Gateway sử dụng NATS message bus để communicate với microservices
- Frontend sử dụng Bearer token authentication, token được lưu trong Zustand store
- Token refresh được handle tự động trong axios interceptor
- Tất cả API responses được validate bằng Zod schemas trước khi sử dụng

