---
phase: requirements
title: Requirements & Problem Understanding - API Integration
description: Kết nối frontend Next.js với backend microservices qua API Gateway
---

# Requirements & Problem Understanding - API Integration

## Problem Statement

**What problem are we solving?**

Frontend hiện đang sử dụng mock data từ `lib/mock-data.ts`. Cần kết nối với backend microservices thật qua API Gateway để:

- Thực hiện authentication/authorization thực tế
- Lưu trữ và đồng bộ dữ liệu giữa client và server
- Xử lý các business logic phức tạp như payments, orders, inventory
- Hỗ trợ tính năng AR với backend storage

**Người bị ảnh hưởng**: Toàn bộ ứng dụng e-commerce
**Hiện trạng**: Đang dùng mock data, không có persistence, không có authentication thật

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals:

1. Kết nối frontend với API Gateway (`http://localhost:3000`)
2. Implement authentication flow với JWT tokens (access + refresh)
3. Migrate từ mock data sang API calls thật cho tất cả domains
4. Xử lý errors và loading states một cách nhất quán
5. Implement proper TypeScript types dựa trên backend DTOs

### Secondary Goals:

1. Optimize performance với caching và request deduplication
2. Implement offline support cho một số features
3. Setup monitoring và error tracking

### Non-Goals:

- Không thay đổi backend API structure
- Không implement GraphQL layer (dùng REST API trực tiếp)
- Không làm real-time updates (WebSockets) trong phase này

## User Stories & Use Cases

### Authentication:

- **As a user**, tôi muốn đăng ký tài khoản để có thể mua hàng và theo dõi đơn hàng
- **As a user**, tôi muốn đăng nhập và token được tự động refresh để không bị logout giữa chừng
- **As a user**, tôi muốn xem thông tin profile của mình

### Products & Categories:

- **As a customer**, tôi muốn xem danh sách sản phẩm với pagination và filtering
- **As a customer**, tôi muốn search sản phẩm theo tên/category
- **As an admin**, tôi muốn CRUD products và categories

### Cart:

- **As a customer**, tôi muốn thêm sản phẩm vào giỏ hàng và nó được sync với server
- **As a customer**, khi đăng nhập, giỏ hàng guest của tôi được merge với user cart

### Orders & Payments:

- **As a customer**, tôi muốn tạo order từ cart và chọn phương thức thanh toán
- **As a customer**, tôi muốn thanh toán qua COD hoặc QR code (SePay)
- **As a customer**, tôi muốn xem lịch sử đơn hàng

### Addresses:

- **As a customer**, tôi muốn quản lý nhiều địa chỉ giao hàng
- **As a customer**, tôi muốn set default address

### AR:

- **As a customer**, tôi muốn chụp AR snapshot và lưu vào server
- **As a customer**, tôi muốn xem AR snapshots của sản phẩm

### Edge Cases:

- Token expiration và auto-refresh
- Network errors và retry logic
- Concurrent requests (race conditions)
- Stock validation khi add to cart
- Order cancellation sau khi payment

## Success Criteria

**How will we know when we're done?**

### Functional Requirements:

- ✅ Tất cả API endpoints trong docs được integrate
- ✅ Authentication flow hoạt động (login, register, refresh, logout)
- ✅ Protected routes require valid token
- ✅ CRUD operations cho tất cả domains
- ✅ Payments flow hoạt động (COD + SePay)
- ✅ Error handling nhất quán trên toàn app

### Technical Requirements:

- ✅ TypeScript types match với backend DTOs 100%
- ✅ No more mock data usage
- ✅ API client có interceptors cho auth và error handling
- ✅ Loading states và error states cho tất cả async operations
- ✅ Unit tests cho services và hooks
- ✅ Integration tests cho critical flows (auth, checkout)

### Performance Benchmarks:

- API response time < 500ms (local development)
- Token refresh không gây interruption cho user
- Optimistic updates cho cart operations

## Constraints & Assumptions

### Technical Constraints:

- **Backend URL**: `http://localhost:3000` (development)
- **Auth Method**: Bearer Token (JWT)
- **Payment Methods**: CHỈ COD và SEPAY (không có credit cards, e-wallets khác)
- **Price Format**: Integer cents (e.g., 199900 = 1,999.00 VND)
- **API Format**: REST JSON (không có GraphQL)

### Business Constraints:

- Phải support guest cart trước khi login
- Phải validate stock trước khi add to cart
- Orders không thể edit sau khi created (chỉ cancel)
- COD payments là UNPAID cho đến khi shipper confirm

### Assumptions:

- Backend services đang chạy và accessible
- NATS messaging hoạt động ổn định
- SePay webhook configuration đã setup
- Database migrations đã chạy
- Không có breaking changes trong backend APIs

## Domain Structure Mapping

### Frontend → Backend Mapping:

| Frontend Domain | Backend Service | API Prefix      | Notes                            |
| --------------- | --------------- | --------------- | -------------------------------- |
| `auth`          | user-service    | `/auth`         | Login, register, refresh, verify |
| `users`         | user-service    | `/users`        | User CRUD, profile management    |
| `addresses`     | user-service    | `/addresses`    | Shipping addresses               |
| `products`      | product-service | `/products`     | Product catalog                  |
| `categories`    | product-service | `/categories`   | Product categories               |
| `cart`          | cart-service    | `/cart`         | Shopping cart                    |
| `orders`        | order-service   | `/orders`       | Order management                 |
| `payments`      | payment-service | `/payments`     | COD & SePay                      |
| `ar`            | ar-service      | `/ar/snapshots` | AR snapshots                     |

### Deprecated/Unused Domains:

- ❌ `profile` - Merge vào `users`
- ❌ `virtual-tryon` - Rename thành `ar`

## Questions & Open Items

### Resolved:

- ✅ Base URL: `http://localhost:3000`
- ✅ Authentication method: Bearer Token
- ✅ Payment methods: COD và SEPAY only
- ✅ Price format: Integer cents

### Unresolved Questions:

1. **Environment Variables**:

   - Có cần separate `.env.local` cho development và production không?
   - API URL cho staging/production là gì?

2. **Error Handling**:

   - Toast notifications hay modal errors?
   - Retry strategy cho failed requests?

3. **Caching Strategy**:

   - Dùng React Query hay SWR hay custom?
   - Cache invalidation rules?

4. **File Upload**:

   - AR snapshots upload lên đâu? (S3, Cloudinary, local?)
   - Product images upload flow?

5. **Testing**:
   - Mock API trong tests hay dùng MSW?
   - E2E testing với Playwright hay Cypress?

### Items Requiring Clarification:

- [ ] Production API URL và SSL setup
- [ ] Rate limiting policies
- [ ] Image CDN configuration
- [ ] Error logging service (Sentry?)
- [ ] Analytics tracking (GA, Mixpanel?)
