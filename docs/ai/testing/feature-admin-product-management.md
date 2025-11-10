---
phase: testing
title: Admin Product Management - Testing Strategy
description: Comprehensive testing plan for admin panel CRUD and file upload
feature: admin-product-management
---

# Testing Strategy - Admin Product Management

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage:** 100% of new/changed code (services, hooks, utilities)
- **Integration test scope:** All CRUD API flows + file upload/delete scenarios
- **E2E test scenarios:** Complete admin workflow (login → create → edit → delete)
- **Manual testing:** Browser compatibility, responsive design, error scenarios
- **Alignment:** All tests map back to user stories in requirements doc

**Coverage Commands:**

```bash
# Frontend unit tests with coverage
pnpm test -- --coverage

# Backend unit tests
pnpm test:unit

# Backend E2E tests
pnpm test:e2e

# Frontend E2E tests
pnpm test:e2e
```

**Coverage Thresholds:**

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

**Acceptable Gaps:**

- Config files (no logic)
- Type definitions (no runtime code)
- Mocked external services (MinIO, NATS in test env)

## Unit Tests

**What individual components need testing?**

### Backend - MinIO Service

**File:** `apps/product-app/src/minio/minio.service.spec.ts`

- [ ] **Test: Upload valid image file**

  - Given: Valid JPEG file buffer
  - When: `upload(file)` called
  - Then: MinIO `putObject` called with correct params
  - Then: Returns { url, filename } with valid format

- [ ] **Test: Reject invalid MIME type**

  - Given: PDF file (mimetype: application/pdf)
  - When: `upload(file)` called
  - Then: Throws HttpException with 400 status
  - Then: Error message: "Only image files..."

- [ ] **Test: Reject oversized file**

  - Given: 10MB image file (exceeds 5MB limit)
  - When: `upload(file)` called
  - Then: Throws HttpException with 400 status
  - Then: Error message: "File size exceeds 5MB"

- [ ] **Test: Generate unique filename**

  - Given: Two identical files uploaded
  - When: `upload()` called twice
  - Then: Different filenames returned (hash + timestamp uniqueness)

- [ ] **Test: Handle base64 buffer from NATS**

  - Given: File buffer as base64 string
  - When: `upload(file)` called
  - Then: Correctly converts to Buffer
  - Then: Upload succeeds

- [ ] **Test: Delete file successfully**

  - Given: Existing filename
  - When: `delete(filename)` called
  - Then: MinIO `removeObject` called
  - Then: No error thrown

- [ ] **Test: Delete non-existent file (graceful)**

  - Given: Invalid filename
  - When: `delete(filename)` called
  - Then: Logs warning
  - Then: No exception thrown (graceful)

- [ ] **Test: Upload failure handling**
  - Given: MinIO service unavailable
  - When: `upload(file)` called
  - Then: Throws HttpException with 500 status
  - Then: Error logged with stack trace

**Additional Coverage:**

- Filename sanitization (no special chars)
- Metadata attachment (Content-Type, X-Original-Name)
- URL construction (correct endpoint + bucket + filename)

---

### Backend - Product Service (Admin)

**File:** `apps/product-app/src/products/products.service.spec.ts`

- [ ] **Test: Admin create product without image**

  - Given: Valid product DTO, no file
  - When: `adminCreate(dto, null)` called
  - Then: Product created in DB with imageUrl = null
  - Then: MinIO upload not called

- [ ] **Test: Admin create product with image**

  - Given: Valid product DTO + image file
  - When: `adminCreate(dto, file)` called
  - Then: MinIO upload called
  - Then: Product created with imageUrl + imageFilename

- [ ] **Test: Admin create - image upload fails**

  - Given: Valid DTO, MinIO throws error
  - When: `adminCreate(dto, file)` called
  - Then: Product still created (imageUrl = null)
  - Then: Warning logged

- [ ] **Test: Admin update product - no new image**

  - Given: Existing product, DTO with changes, no file
  - When: `adminUpdate(id, dto, null)` called
  - Then: Product updated
  - Then: Existing imageUrl preserved
  - Then: MinIO delete not called

- [ ] **Test: Admin update product - with new image**

  - Given: Existing product with image, new image file
  - When: `adminUpdate(id, dto, newFile)` called
  - Then: Old image deleted from MinIO
  - Then: New image uploaded
  - Then: Product updated with new imageUrl

- [ ] **Test: Admin update - product not found**

  - Given: Invalid product ID
  - When: `adminUpdate(id, dto, file)` called
  - Then: Throws EntityNotFoundRpcException
  - Then: Error message: "Product with ID ... not found"

- [ ] **Test: Admin soft delete product**

  - Given: Existing product
  - When: `adminSoftDelete(id)` called
  - Then: Product.isDeleted set to true
  - Then: Image NOT deleted (keep for audit)

- [ ] **Test: Admin delete - product not found**

  - Given: Invalid product ID
  - When: `adminSoftDelete(id)` called
  - Then: Throws EntityNotFoundRpcException

- [ ] **Test: Admin list products - no filters**

  - Given: 25 products in DB
  - When: `adminList({ page: 1, limit: 10 })` called
  - Then: Returns first 10 products
  - Then: Meta: { page: 1, limit: 10, total: 25, totalPages: 3 }

- [ ] **Test: Admin list - with search**

  - Given: Products "iPhone 15", "iPhone 14", "Samsung Galaxy"
  - When: `adminList({ search: "iPhone" })` called
  - Then: Returns 2 products
  - Then: Case-insensitive match

- [ ] **Test: Admin list - with category filter**

  - Given: 10 products in category A, 5 in category B
  - When: `adminList({ categoryId: "A" })` called
  - Then: Returns 10 products from category A

- [ ] **Test: Admin list - exclude soft deleted**

  - Given: 3 products, 1 with isDeleted = true
  - When: `adminList({})` called
  - Then: Returns 2 products (deleted excluded)

- [ ] **Test: Admin list - pagination edge case**
  - Given: 10 total products, page 2, limit 20
  - When: `adminList({ page: 2, limit: 20 })` called
  - Then: Returns empty array (valid, no products on page 2)

**Additional Coverage:**

- Prisma query optimization (parallel count + find)
- DTO validation (price >= 0, valid CUID for categoryId - backend uses CUID, not UUID)
- Error handling for DB connection issues

---

### Frontend - Admin Products Service

**File:** `features/products/services/admin-products.service.spec.ts`

- [ ] **Test: List products with query params**

  - Given: apiClient.get mocked
  - When: `adminProductsApi.list({ page: 1, limit: 10, search: "test" })` called
  - Then: GET request to `/products?page=1&limit=10&search=test`
  - Then: Returns ProductListResponse

- [ ] **Test: Get product by ID**

  - Given: apiClient.get mocked with product data
  - When: `adminProductsApi.getById("clx123abc456def789ghi012")` called (CUID format)
  - Then: GET request to `/products/clx123abc456def789ghi012`
  - Then: Returns Product object

- [ ] **Test: Create product with image**

  - Given: apiClient.post mocked
  - When: `adminProductsApi.create({ name, price, image: File })` called
  - Then: POST request with FormData
  - Then: FormData contains: name, price, image fields
  - Then: Content-Type: multipart/form-data header set

- [ ] **Test: Create product without image**

  - Given: apiClient.post mocked
  - When: `adminProductsApi.create({ name, price })` called
  - Then: FormData does not contain image field
  - Then: Request succeeds

- [ ] **Test: Update product - partial data**

  - Given: apiClient.put mocked
  - When: `adminProductsApi.update("clx123abc456def789ghi012", { price: 2000000 })` called (CUID format)
  - Then: PUT request with FormData containing only price
  - Then: Other fields not included

- [ ] **Test: Delete product**

  - Given: apiClient.delete mocked
  - When: `adminProductsApi.delete("clx123abc456def789ghi012")` called (CUID format)
  - Then: DELETE request to `/products/clx123abc456def789ghi012`
  - Then: No body sent

- [ ] **Test: FormData construction - price conversion**

  - Given: Create request with price = 1000000 (number)
  - When: FormData constructed
  - Then: Price appended as string "1000000"

- [ ] **Test: Error handling - network failure**
  - Given: apiClient throws network error
  - When: Any method called
  - Then: Error propagated to caller
  - Then: Error shape preserved

**Additional Coverage:**

- Conditional FormData append (only if field exists)
- Correct HTTP methods (GET, POST, PUT, DELETE)
- Type safety (TypeScript compile checks)

---

### Frontend - Hooks

**File:** `features/products/hooks/use-admin-products.spec.ts`

- [ ] **Test: useAdminProducts - initial load**

  - Given: API mocked to return products
  - When: Hook mounted with params { page: 1, limit: 10 }
  - Then: Loading = true initially
  - Then: API called with correct params
  - Then: Loading = false after fetch
  - Then: Data populated

- [ ] **Test: useAdminProducts - params change triggers refetch**

  - Given: Hook mounted with page = 1
  - When: Params updated to page = 2
  - Then: API called again with page = 2
  - Then: New data loaded

- [ ] **Test: useAdminProducts - error handling**

  - Given: API throws error
  - When: Hook mounted
  - Then: Error state populated
  - Then: Error message extracted correctly

- [ ] **Test: useAdminProducts - manual refetch**
  - Given: Hook with data loaded
  - When: `refetch()` called
  - Then: API called again
  - Then: Data refreshed

**File:** `features/products/hooks/use-create-product.spec.ts`

- [ ] **Test: useCreateProduct - success flow**

  - Given: API mocked to return created product
  - When: `createProduct(data)` called
  - Then: Loading = true during call
  - Then: Success toast shown
  - Then: Loading = false after
  - Then: Returns created product

- [ ] **Test: useCreateProduct - error flow**

  - Given: API throws validation error
  - When: `createProduct(data)` called
  - Then: Error toast shown
  - Then: Error state populated
  - Then: Error re-thrown for component

- [ ] **Test: useCreateProduct - concurrent calls**
  - Given: First call in progress
  - When: Second call initiated
  - Then: Loading state correct (batched or sequential)

**Similar tests for:**

- `use-update-product.spec.ts`
- `use-delete-product.spec.ts`

**Additional Coverage:**

- useEffect dependency arrays correct
- Cleanup on unmount (AbortController)
- Toast library integration (mock toast calls)

---

### Frontend - Form Validation (Zod Schema)

**File:** `features/products/schemas/product-form.schema.spec.ts`

- [ ] **Test: Valid product data passes**

  - Given: { name: "Test", price: 100000, image: validFile }
  - When: Schema validates
  - Then: No errors

- [ ] **Test: Missing required field fails**

  - Given: { price: 100000 } (no name)
  - When: Schema validates
  - Then: Error: "Tên sản phẩm là bắt buộc"

- [ ] **Test: Negative price fails**

  - Given: { name: "Test", price: -100 }
  - When: Schema validates
  - Then: Error: "Giá phải lớn hơn hoặc bằng 0"

- [ ] **Test: Oversized file fails**

  - Given: Image file with size = 10MB
  - When: Schema validates
  - Then: Error: "File size tối đa 5MB"

- [ ] **Test: Invalid file type fails**

  - Given: PDF file
  - When: Schema validates
  - Then: Error: "Chỉ chấp nhận file JPG, PNG, WebP"

- [ ] **Test: Optional fields work**

  - Given: { name: "Test", price: 100000 } (no description, categoryId, image)
  - When: Schema validates
  - Then: No errors

- [ ] **Test: Invalid CUID for categoryId fails**
  - Given: { categoryId: "not-a-valid-cuid" }
  - When: Schema validates
  - Then: Error: "Category ID không hợp lệ" (Backend uses CUID format, not UUID)

**Additional Coverage:**

- Min/max string lengths
- Whitespace trimming
- Type coercion (if any)

---

## Integration Tests

**How do we test component interactions?**

### Backend Integration Tests

**File:** `apps/product-app/test/admin-products.e2e-spec.ts`

- [ ] **Integration: Create product with image upload**

  - Setup: MinIO container running, test DB seeded
  - Given: NATS message with product DTO + file buffer
  - When: Message handler processes request
  - Then: Product created in database
  - Then: File exists in MinIO bucket
  - Then: Product.imageUrl accessible (HTTP 200)

- [ ] **Integration: Update product - replace image**

  - Setup: Existing product with image A
  - Given: NATS update message with new image B
  - When: Handler processes request
  - Then: Image A deleted from MinIO
  - Then: Image B uploaded to MinIO
  - Then: Product.imageUrl updated
  - Then: Old URL returns 404, new URL returns 200

- [ ] **Integration: Soft delete preserves image**

  - Setup: Existing product with image
  - Given: NATS delete message
  - When: Handler processes request
  - Then: Product.isDeleted = true in DB
  - Then: Image still exists in MinIO
  - Then: Image URL still accessible

- [ ] **Integration: List products respects filters**

  - Setup: 20 products in DB (10 category A, 10 category B)
  - Given: NATS list message with categoryId = A
  - When: Handler processes request
  - Then: Returns 10 products from category A
  - Then: Pagination metadata correct

- [ ] **Integration: Error rollback - DB insert fails**

  - Setup: Mock Prisma to throw error after image upload
  - Given: NATS create message
  - When: Handler processes request
  - Then: Image uploaded to MinIO initially
  - Then: DB insert fails
  - Then: Image deleted from MinIO (rollback)
  - Then: Error response sent

- [ ] **Integration: Concurrent uploads**

  - Setup: Send 5 create messages simultaneously
  - When: Handlers process in parallel
  - Then: All 5 products created
  - Then: All 5 images uploaded
  - Then: No filename collisions

- [ ] **Integration: Gateway → Microservice flow**
  - Setup: Start Gateway + Product-app + NATS
  - Given: HTTP POST to `/products` with auth token + ADMIN role
  - When: Gateway forwards to microservice
  - Then: Microservice receives message
  - Then: Response returned to Gateway
  - Then: HTTP 201 response to client

**Additional Coverage:**

- NATS timeout handling (message ack)
- DB transaction rollback scenarios
- MinIO connection failures (retry logic)

---

### Frontend Integration Tests

**File:** `features/products/__tests__/admin-products-integration.spec.tsx`

- [ ] **Integration: Product form submission**

  - Setup: Render ProductForm with mocked API
  - Given: User fills all fields + selects image
  - When: Form submitted
  - Then: Zod validation passes
  - Then: API called with FormData
  - Then: Success callback invoked

- [ ] **Integration: Product list with filters**

  - Setup: Render ProductList + ProductFilters
  - Given: User types in search box "iPhone"
  - When: Debounce completes (300ms)
  - Then: API called with search param
  - Then: Table updates with filtered results

- [ ] **Integration: Image upload preview**

  - Setup: Render ProductImageUpload component
  - Given: User selects image file
  - When: File loaded via FileReader
  - Then: Preview image displayed
  - Then: File object stored in form state

- [ ] **Integration: Delete confirmation flow**

  - Setup: Render ProductList with DeleteDialog
  - Given: User clicks Delete on row
  - When: Dialog opens
  - Then: Product name displayed in confirmation
  - Given: User clicks Confirm
  - Then: API delete called
  - Then: Toast success shown
  - Then: List refreshed (refetch)

- [ ] **Integration: Edit form pre-population**

  - Setup: Render EditProductPage with product ID
  - Given: Component mounts
  - When: API fetches product data
  - Then: Form fields populated with existing values
  - Then: Existing image preview shown

- [ ] **Integration: Auth store role check**
  - Setup: Mock auth store with role = USER
  - Given: User navigates to /admin/products
  - When: AdminLayout component renders
  - Then: Redirect to / triggered
  - Then: Error toast shown

**Additional Coverage:**

- Form validation errors display
- Loading states during API calls
- Empty states (no products found)
- Pagination controls interaction

---

## End-to-End Tests

**What user flows need validation?**

**File:** `e2e/admin-product-management.spec.ts`

### E2E Flow 1: Admin Product CRUD Workflow

- [ ] **E2E: Complete product lifecycle**

  - **Setup:** Start all services (Backend, Frontend, MinIO, DB)
  - **Seed:** Create admin user, login to get token

  **Step 1: Login as admin**

  - Navigate to `/auth/login`
  - Fill email: `admin@example.com`
  - Fill password: `Admin123!`
  - Submit form
  - Assert: Redirected to `/`
  - Assert: Auth token stored in localStorage

  **Step 2: Navigate to admin panel**

  - Click "Admin Panel" link (visible only for admin)
  - Assert: Redirected to `/admin/products`
  - Assert: Product list visible
  - Assert: "Thêm Sản Phẩm" button visible

  **Step 3: Create new product**

  - Click "Thêm Sản Phẩm" button
  - Assert: Redirected to `/admin/products/new`
  - Fill name: "Gọng kính Rayban Classic"
  - Fill price: "1999000"
  - Fill description: "Gọng kính thời trang cao cấp"
  - Select category: "Gọng Kính"
  - Upload image: `test-fixtures/rayban.jpg`
  - Assert: Image preview displayed
  - Click "Lưu sản phẩm"
  - Assert: Toast success: "Tạo sản phẩm thành công"
  - Assert: Redirected to `/admin/products`
  - Assert: New product visible in table

  **Step 4: Search for product**

  - Type in search box: "Rayban"
  - Wait 500ms (debounce)
  - Assert: Table shows 1 product
  - Assert: Product name contains "Rayban"

  **Step 5: Edit product**

  - Click "Edit" button on product row
  - Assert: Redirected to `/admin/products/{id}/edit`
  - Assert: Form pre-filled with existing data
  - Assert: Existing image preview shown
  - Change price to: "2199000"
  - Upload new image: `test-fixtures/rayban-v2.jpg`
  - Click "Lưu sản phẩm"
  - Assert: Toast success
  - Assert: Redirected to list
  - Assert: Price updated in table

  **Step 6: Delete product**

  - Click "Delete" button on product row
  - Assert: Confirmation dialog appears
  - Assert: Dialog shows product name
  - Click "Xóa" button
  - Assert: Toast success: "Xóa sản phẩm thành công"
  - Assert: Product removed from table
  - Verify: Product still in DB with isDeleted = true
  - Verify: Image still in MinIO (not deleted)

---

### E2E Flow 2: Non-admin Access Denied

- [ ] **E2E: Regular user blocked from admin panel**

  - **Setup:** Login as regular user (role = USER)

  **Step 1: Attempt to access admin**

  - Navigate to `/admin/products` directly
  - Assert: Redirected to `/`
  - Assert: Toast error: "Bạn không có quyền truy cập"

  **Step 2: Admin nav hidden**

  - Check header navigation
  - Assert: "Admin Panel" link NOT visible

---

### E2E Flow 3: Error Scenarios

- [ ] **E2E: Network error during create**

  - **Setup:** Mock API to return 500 error
  - Navigate to `/admin/products/new`
  - Fill form completely
  - Click submit
  - Assert: Toast error with message
  - Assert: Still on form page (not redirected)
  - Assert: Form data preserved

- [ ] **E2E: Invalid file upload**

  - Navigate to `/admin/products/new`
  - Fill required fields
  - Upload PDF file (invalid type)
  - Click submit
  - Assert: Validation error: "Chỉ chấp nhận file JPG, PNG, WebP"
  - Assert: Form not submitted

- [ ] **E2E: JWT token expired**

  - **Setup:** Manually expire token in localStorage
  - Navigate to `/admin/products`
  - Assert: API call triggers token refresh
  - Assert: Page loads successfully (seamless refresh)
  - OR: Redirected to login if refresh fails

- [ ] **E2E: MinIO unavailable**
  - **Setup:** Stop MinIO container
  - Create product with image
  - Assert: Product created with imageUrl = null
  - Assert: Toast warning (optional)
  - Assert: Product visible in list with placeholder image

---

### E2E Flow 4: Responsive Design

- [ ] **E2E: Mobile viewport (375x667)**

  - Set viewport to mobile
  - Navigate to `/admin/products`
  - Assert: Sidebar collapses to hamburger menu
  - Assert: Table scrolls horizontally
  - Assert: Form fields stack vertically
  - Assert: Touch-friendly button sizes

- [ ] **E2E: Tablet viewport (768x1024)**
  - Set viewport to tablet
  - Navigate to `/admin/products`
  - Assert: Sidebar visible but narrower
  - Assert: Table columns readable
  - Assert: Form layout responsive

---

### E2E Flow 5: Browser Compatibility

- [ ] **E2E: Chrome (latest)**

  - Run all E2E tests in Chrome
  - Assert: All tests pass
  - Assert: No console errors

- [ ] **E2E: Firefox (latest)**

  - Run all E2E tests in Firefox
  - Assert: All tests pass
  - Assert: File upload works (different API)

- [ ] **E2E: Safari (if available)**
  - Run critical path tests in Safari
  - Assert: Image preview works
  - Assert: FormData compatibility

---

## Test Data

**What data do we use for testing?**

### Test Fixtures

**Location:** `test-fixtures/`

```
test-fixtures/
├── images/
│   ├── valid-product.jpg       # 2MB, 1920x1080, JPEG
│   ├── valid-product.png       # 1MB, 1200x800, PNG
│   ├── valid-product.webp      # 500KB, 1000x1000, WebP
│   ├── oversized.jpg           # 10MB (exceeds limit)
│   └── invalid.pdf             # Invalid file type
│
└── data/
    ├── products.json           # Sample product data
    └── categories.json         # Sample categories
```

**Sample data:**

```json
// test-fixtures/data/products.json
[
  {
    "name": "Gọng kính Rayban Classic",
    "price": 1999000,
    "description": "Gọng kính thời trang cao cấp",
    "categoryId": "clx123abc456def789ghi012" // CUID format
  },
  {
    "name": "Kính mát Oakley Sport",
    "price": 2499000,
    "description": "Kính mát thể thao chuyên nghiệp",
    "categoryId": "clx456def789ghi012jkl345" // CUID format
  }
]
```

### Seed Data Requirements

**Backend test DB:**

```sql
-- Run before E2E tests
-- Note: Backend uses CUID format, not UUID
INSERT INTO categories (id, name, slug) VALUES
  ('clx123abc456def789ghi012', 'Gọng Kính', 'gong-kinh'),
  ('clx456def789ghi012jkl345', 'Kính Mát', 'kinh-mat');

INSERT INTO users (id, email, password_hash, role) VALUES
  ('clx789ghi012jkl345mno678', 'admin@test.com', '$hashed', 'ADMIN'),
  ('clx012jkl345mno678pqr901', 'user@test.com', '$hashed', 'USER');
```

### Mock Data (Unit Tests)

**Example mock:**

```typescript
const mockProduct: Product = {
  id: "clx123abc456def789ghi012", // CUID format
  name: "Test Product",
  price: 1000000,
  description: "Test description",
  imageUrl: "http://localhost:9000/products/test.jpg",
  imageFilename: "test.jpg",
  categoryId: "clx456def789ghi012jkl345", // CUID format
  category: { id: "clx456def789ghi012jkl345", name: "Gọng Kính", slug: "gong-kinh" },
  isDeleted: false,
  createdAt: "2025-11-04T00:00:00.000Z",
  updatedAt: "2025-11-04T00:00:00.000Z",
};
```

---

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands

```bash
# Frontend unit test coverage
pnpm test -- --coverage --watchAll=false

# View HTML coverage report
open coverage/lcov-report/index.html

# Backend coverage
pnpm test:unit -- --coverage

# E2E test with video/screenshots
pnpm test:e2e --headed
```

### Coverage Reports

**Expected output:**

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |     100 |      100 |     100 |     100 |
 services/          |         |          |         |         |
  admin-products    |     100 |      100 |     100 |     100 |
 hooks/             |         |          |         |         |
  use-admin-products|     100 |      100 |     100 |     100 |
  use-create-product|     100 |      100 |     100 |     100 |
  use-update-product|     100 |      100 |     100 |     100 |
  use-delete-product|     100 |      100 |     100 |     100 |
 schemas/           |         |          |         |         |
  product-form      |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|
```

### Coverage Gaps (Acceptable)

Files excluded from coverage:

- `*.types.ts` - Type definitions only
- `config.ts` - Static configuration
- `*.spec.ts` - Test files themselves
- `test-utils/` - Test helpers

### CI/CD Integration

**GitHub Actions workflow:**

```yaml
name: Test Admin Product Management

on:
  pull_request:
    paths:
      - "features/products/**"
      - "app/admin/**"
      - "apps/product-app/**"

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
      nats:
        image: nats:latest
      minio:
        image: minio/minio:latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test -- --coverage
      - name: Run E2E tests
        run: pnpm test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Manual Testing

**What requires human validation?**

### Manual Testing Checklist

**Accessibility (A11y):**

- [ ] All form inputs have labels
- [ ] Focus visible on keyboard navigation (Tab key)
- [ ] Screen reader announces form errors
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Alt text for images
- [ ] ARIA labels for icon buttons

**Usability:**

- [ ] Error messages clear and actionable
- [ ] Success feedback immediate (toast)
- [ ] Loading states prevent double-submit
- [ ] Form remembers data on validation error
- [ ] Image preview accurate (WYSIWYG)

**Visual QA:**

- [ ] Layout consistent across pages
- [ ] No text overflow or cut-off
- [ ] Images scale properly (aspect ratio)
- [ ] Spacing/padding consistent
- [ ] Hover states on interactive elements

**Browser Compatibility:**

- [ ] Chrome 120+ (Desktop + Mobile)
- [ ] Firefox 120+
- [ ] Safari 17+ (macOS + iOS)
- [ ] Edge 120+

**Responsive Breakpoints:**

- [ ] 375px (Mobile - iPhone SE)
- [ ] 768px (Tablet - iPad)
- [ ] 1024px (Desktop - Small)
- [ ] 1920px (Desktop - Large)

**Performance:**

- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] No memory leaks (Chrome DevTools)

**Security:**

- [ ] JWT token in httpOnly cookie (not localStorage for production)
- [ ] CSRF protection enabled
- [ ] XSS protection (sanitize inputs)
- [ ] No sensitive data in URLs
- [ ] HTTPS in production

---

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

**Tool:** Artillery or k6

**Scenario 1: Concurrent product creation**

```yaml
# artillery-config.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Sustained load"
scenarios:
  - name: "Create products"
    flow:
      - post:
          url: "/admin/products"
          headers:
            Authorization: "Bearer {{token}}"
          formData:
            name: "Load Test Product {{ $randomString() }}"
            price: "1000000"
```

**Acceptance criteria:**

- 95th percentile response time < 2s
- Error rate < 1%
- MinIO throughput > 50 uploads/sec

**Scenario 2: Product list with pagination**

- 1000 products in DB
- 50 concurrent users
- Page through all products
- Assert: P95 response time < 1s

---

## Bug Tracking

**How do we manage issues?**

### Issue Template

**Title:** [Bug] [Admin Products] Brief description

**Description:**

```
**Steps to reproduce:**
1. Navigate to /admin/products
2. Click "Thêm Sản Phẩm"
3. Upload 10MB image
4. Click submit

**Expected behavior:**
- Client-side validation rejects file
- Error message: "File size tối đa 5MB"

**Actual behavior:**
- File uploaded to server
- Server returns 400 error
- No user-friendly message

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080

**Screenshots:**
[Attach screenshot]

**Console errors:**
[Paste console output]
```

### Bug Severity Levels

| Level    | Description                       | Response Time |
| -------- | --------------------------------- | ------------- |
| Critical | Feature broken, blocks deployment | Immediate     |
| High     | Major functionality broken        | < 24 hours    |
| Medium   | Minor bug, workaround available   | < 3 days      |
| Low      | Cosmetic issue, low impact        | Backlog       |

### Regression Testing Strategy

**Before each release:**

- [ ] Run full E2E test suite
- [ ] Smoke test critical paths (create, edit, delete)
- [ ] Verify no new errors in Sentry/logs
- [ ] Check test coverage hasn't decreased

---

**Testing Sign-off:**

All tests must pass before merging to main:

- [ ] Unit tests: 100% coverage
- [ ] Integration tests: All passing
- [ ] E2E tests: All critical flows passing
- [ ] Manual testing checklist: Complete
- [ ] Performance benchmarks: Met
- [ ] Security review: Approved

**Reviewer:** ******\_\_\_******
**Date:** ******\_\_\_******

---

**Next Steps:**

1. Implement tests alongside features (TDD)
2. Run tests locally before pushing
3. Fix any failing tests immediately
4. Update docs if test strategy changes
5. Monitor test execution time (keep CI fast)
