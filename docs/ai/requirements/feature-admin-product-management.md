---
phase: requirements
title: Admin Product Management - Requirements & Problem Understanding
description: Admin panel for managing products with CRUD operations and image upload
feature: admin-product-management
---

# Requirements & Problem Understanding - Admin Product Management

## Problem Statement

**What problem are we solving?**

Hiện tại hệ thống e-commerce eyewear store **không có giao diện admin** để quản lý sản phẩm. Việc thêm, sửa, xóa sản phẩm phải thực hiện qua database trực tiếp hoặc API tools (Postman/Insomnia), gây khó khăn và không an toàn cho quản trị viên.

**Người bị ảnh hưởng:**

- Admin/Store Manager cần quản lý catalog sản phẩm kính mắt
- Content Manager cần cập nhật thông tin sản phẩm thường xuyên
- Business Owner cần xem tổng quan sản phẩm trong hệ thống

**Tình trạng hiện tại:**

- Không có UI để quản lý products
- Phải dùng database tools hoặc API clients để CRUD
- Không có cách upload và quản lý ảnh sản phẩm dễ dàng
- Thiếu search, filter, pagination cho danh sách sản phẩm

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals

1. **Admin Layout riêng biệt**: Tạo layout với sidebar navigation, header cho admin panel
2. **Product CRUD**: Xem, tạo, sửa, xóa (soft delete) sản phẩm qua UI
3. **Image Upload**: Upload ảnh sản phẩm lên MinIO local storage
4. **Product Listing**: Danh sách sản phẩm với search, filter by category, pagination

### Secondary Goals

1. Admin role-based access (chỉ user có role ADMIN mới truy cập được)
2. Validation form với feedback rõ ràng
3. Responsive design cho admin panel
4. Toast notifications cho actions (success/error)

### Non-Goals (Out of Scope)

- ❌ Multiple image upload (chỉ 1 ảnh/sản phẩm trong MVP)
- ❌ Product variants (size, color) - future feature
- ❌ Bulk operations (mass delete, import CSV)
- ❌ Inventory/stock management
- ❌ Product analytics/statistics
- ❌ Draft/Published workflow

## User Stories & Use Cases

**How will users interact with the solution?**

### US-1: View Product List

**As an** Admin  
**I want to** xem danh sách tất cả sản phẩm với pagination  
**So that** tôi có thể tổng quan toàn bộ catalog và tìm sản phẩm cần quản lý

**Acceptance Criteria:**

- Hiển thị table/grid với: Image thumbnail, Name, Price, Category, Actions
- Pagination với configurable page size (10, 25, 50, 100 items/page)
- Loading state khi fetch data
- Empty state khi chưa có sản phẩm

### US-2: Search & Filter Products

**As an** Admin  
**I want to** search sản phẩm theo tên và filter theo category  
**So that** tôi có thể nhanh chóng tìm sản phẩm cần chỉnh sửa

**Acceptance Criteria:**

- Search box với debounce (300ms)
- Filter dropdown cho categories
- Kết hợp search + filter
- URL query params để bookmark kết quả tìm kiếm

### US-3: Create New Product

**As an** Admin  
**I want to** tạo sản phẩm mới với tên, giá, mô tả, category và ảnh  
**So that** tôi có thể thêm sản phẩm mới vào store

**Acceptance Criteria:**

- Form với fields: Name (required), Price (required), Description (optional), Category (select dropdown), Image (file upload)
- Client-side validation (required fields, price > 0, file type)
- Preview ảnh trước khi submit
- Upload ảnh lên MinIO và lưu URL vào database
- Success toast và redirect về list sau khi tạo

### US-4: Edit Existing Product

**As an** Admin  
**I want to** cập nhật thông tin sản phẩm đã có  
**So that** tôi có thể sửa lỗi hoặc cập nhật giá/mô tả

**Acceptance Criteria:**

- Pre-populate form với data hiện tại
- Cho phép đổi ảnh mới (xóa ảnh cũ trên MinIO)
- Giữ nguyên ảnh cũ nếu không upload ảnh mới
- Validation tương tự create
- Success toast sau khi update

### US-5: Delete Product (Soft Delete)

**As an** Admin  
**I want to** xóa sản phẩm không còn bán  
**So that** chúng không hiển thị trên store nữa nhưng vẫn giữ data

**Acceptance Criteria:**

- Confirmation dialog trước khi xóa
- Soft delete (set `isDeleted = true`) thay vì hard delete
- Ảnh trên MinIO không bị xóa (để rollback nếu cần)
- Success toast và refresh list

### US-6: Access Control

**As a** Regular User (không phải Admin)  
**I want to** bị chặn khi cố truy cập admin panel  
**So that** chỉ admin mới quản lý được sản phẩm

**Acceptance Criteria:**

- Redirect về `/` nếu user không có role ADMIN
- Show error toast: "Bạn không có quyền truy cập trang này"
- Admin nav links chỉ hiển thị cho admin users

## Success Criteria

**How will we know when we're done?**

### Measurable Outcomes

1. ✅ Admin có thể CRUD sản phẩm hoàn toàn qua UI (không cần database tools)
2. ✅ Upload ảnh thành công lên MinIO và hiển thị đúng trên frontend
3. ✅ Search + filter trả về kết quả chính xác < 1s
4. ✅ Form validation ngăn chặn invalid data
5. ✅ Non-admin users bị block khỏi `/admin/*` routes

### Acceptance Criteria

- [ ] All user stories (US-1 đến US-6) đều pass manual testing
- [ ] Unit tests cho services/hooks đạt 100% coverage
- [ ] Integration tests cho product flows (create, edit, delete)
- [ ] E2E test cho admin workflow đầy đủ
- [ ] MinIO container chạy stable và persist data
- [ ] No console errors trong browser

### Performance Benchmarks

- Product list page load < 2s (với 100 products)
- Image upload < 5s (file size < 5MB)
- Search debounce 300ms
- Form submission + navigation < 3s

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints

- **Frontend**: Next.js 15 + TypeScript, Shadcn UI components
- **Backend**: NestJS microservices (product-app đã có sẵn API)
- **Storage**: MinIO local Docker container (không dùng cloud S3)
- **Database**: PostgreSQL với Prisma ORM
- **No giới hạn**: File size, số lượng sản phẩm (dev environment)

### Business Constraints

- Chỉ 1 ảnh/sản phẩm (multiple images là future scope)
- Soft delete only (giữ data cho audit)
- Public read access cho ảnh (không cần authentication để xem ảnh)

### Time/Budget Constraints

- Timeline: 1-2 weeks implementation
- Scope giới hạn ở basic CRUD (không có advanced features)
- Reuse existing components từ Shadcn UI

### Assumptions

1. Backend API (`product-app`) đã có đầy đủ endpoints cho CRUD
2. MinIO setup theo doc đã cung cấp (ports 9000, 9001)
3. Auth system đã có role check (JWT token chứa user role)
4. Categories đã tồn tại trong DB (không cần CRUD categories)
5. Không cần multi-language support (Vietnamese only)

## Questions & Open Items

**What do we still need to clarify?**

### Technical Questions

- [ ] Backend API có rate limiting cho upload không?
- [ ] Max file size cho ảnh? (suggest: 5MB)
- [ ] Image dimensions yêu cầu? (resize on upload?)
- [ ] Có cần image optimization (compression, WebP conversion)?

### Design Questions

- [ ] Admin sidebar có menu items nào ngoài Products? (Categories, Orders, Users?)
- [ ] Color scheme cho admin panel khác với user-facing site không?
- [ ] Có cần dark mode cho admin?

### Product Questions

- [ ] Khi delete product, có cần check xem có orders đang reference không?
- [ ] Product có trạng thái Draft/Published không? (hiện tại: out of scope)
- [ ] Có cần audit log (ai tạo, ai sửa, khi nào)?

### Deployment Questions

- [ ] MinIO data persistence strategy cho production?
- [ ] MinIO bucket backup plan?
- [ ] CORS config cho MinIO khi deploy?

---

**Next Steps:**

1. Review và confirm requirements với stakeholders
2. Proceed to Design phase → `docs/ai/design/feature-admin-product-management.md`
3. Clarify open questions trước khi bắt đầu design
