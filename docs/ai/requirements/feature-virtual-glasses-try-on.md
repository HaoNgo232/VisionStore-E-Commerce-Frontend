---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
feature: virtual-glasses-try-on
---

# Requirements & Problem Understanding

## Problem Statement

**What problem are we solving?**

- **Core Problem**: Khách hàng không thể thử kính trước khi mua hàng online, dẫn đến do dự và tỷ lệ mua hàng thấp
- **Who is affected**:
  - Khách hàng muốn mua kính nhưng không chắc chắn về kiểu dáng phù hợp với khuôn mặt
  - Doanh nghiệp mất cơ hội bán hàng do thiếu trải nghiệm thực tế
- **Current workaround**:
  - Khách hàng phải đến cửa hàng vật lý để thử
  - Mua online dựa vào hình ảnh sản phẩm và mô tả, rủi ro cao về sai size/style
  - Tỷ lệ trả hàng cao do không vừa ý

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals

- Cho phép khách hàng thử kính ảo (AR) trực tiếp trên khuôn mặt thông qua webcam
- Tăng trải nghiệm mua sắm và tỷ lệ chuyển đổi (conversion rate)
- Giảm tỷ lệ trả hàng do không vừa ý về kiểu dáng

### Secondary Goals

- Lưu lịch sử các mẫu kính đã thử để khách hàng dễ so sánh
- Cho phép chụp ảnh khi thử kính để lưu lại hoặc chia sẻ
- Tạo điểm khác biệt cạnh tranh cho nền tảng

### Non-Goals (Out of Scope)

- Giao diện quản lý admin cho 3D models (để phase sau)
- Virtual try-on cho các sản phẩm khác (mũ, khăn, v.v.)
- Social sharing features phức tạp (chỉ cần download ảnh)
- AR trên mobile native app (chỉ focus web-based)

## User Stories & Use Cases

### 👤 Customer Stories (Priority: HIGH)

#### US-1: Thử Kính Ảo Qua Webcam

**As a** khách hàng muốn mua kính  
**I want to** bật webcam và nhìn thấy kính hiển thị trên khuôn mặt của tôi theo thời gian thực  
**So that** tôi có thể đánh giá kính có phù hợp với khuôn mặt mình không

**Acceptance Criteria**:

- Có nút "Thử Kính Ảo" rõ ràng trên trang chi tiết sản phẩm
- Yêu cầu quyền truy cập webcam, hiển thị lỗi thân thiện nếu bị từ chối
- Facemesh model phát hiện khuôn mặt trong vòng 3-5 giây
- Model 3D kính overlay chính xác trên mắt theo góc quay đầu
- Frame rate tối thiểu 24 FPS cho trải nghiệm mượt

#### US-2: Chọn Nhiều Mẫu Kính

**As a** khách hàng đang thử kính  
**I want to** xem danh sách các mẫu kính có sẵn và chuyển đổi giữa các mẫu  
**So that** tôi có thể so sánh và chọn mẫu yêu thích

**Acceptance Criteria**:

- Hiển thị carousel/slider với thumbnail các mẫu kính
- Click vào thumbnail để đổi model 3D ngay lập tức
- Hiển thị tên sản phẩm và giá bên cạnh thumbnail
- Highlight mẫu đang được chọn
- Support swipe gestures trên mobile

#### US-3: Chụp Ảnh Khi Thử Kính

**As a** khách hàng đang thử kính  
**I want to** chụp ảnh bản thân khi đeo kính ảo  
**So that** tôi có thể lưu lại để xem xét hoặc xin ý kiến người khác

**Acceptance Criteria**:

- Có nút "Chụp Ảnh" rõ ràng khi đang trong chế độ thử kính
- Ảnh chụp bao gồm cả khuôn mặt + model 3D kính
- Cho phép download ảnh về máy (format PNG/JPEG)
- Hiển thị preview ảnh vừa chụp trước khi download
- Watermark nhỏ với logo website (optional)

#### US-4: Xem Lịch Sử Đã Thử

**As a** khách hàng đã đăng nhập  
**I want to** xem lại các mẫu kính tôi đã thử  
**So that** tôi có thể dễ dàng tìm lại các mẫu yêu thích

**Acceptance Criteria**:

- Lưu lịch sử thử kính vào database (linked to user)
- Hiển thị danh sách "Đã Thử Gần Đây" trong profile
- Mỗi item hiển thị: thumbnail kính + tên sản phẩm + thời gian thử
- Click vào item để xem lại trang sản phẩm
- Giới hạn lưu 50 items gần nhất

#### US-5: Tìm Sản Phẩm Có Model 3D

**As a** khách hàng đang duyệt danh sách sản phẩm  
**I want to** filter hoặc thấy badge "Có Thể Thử Ảo"  
**So that** tôi biết sản phẩm nào hỗ trợ tính năng AR

**Acceptance Criteria**:

- Badge "🥽 Thử Ảo" hiển thị trên product card
- Filter option "Hỗ Trợ Thử Ảo" trong trang danh sách sản phẩm
- API endpoint trả về field `hasVirtualTryOn: boolean`
- Search results ưu tiên sản phẩm có virtual try-on

### 👨‍💼 Admin Stories (Priority: LOW - Phase 2)

#### US-6: Upload Model 3D cho Sản Phẩm

**As an** admin  
**I want to** upload file GLTF và cấu hình vị trí/scale cho model 3D  
**So that** sản phẩm kính mới có thể hỗ trợ virtual try-on

**Note**: Feature này để phase sau, hiện tại dùng seed data

## Success Criteria

**How will we know when we're done?**

### Measurable Outcomes

- **Technical Performance**:

- Facemesh detection latency < 3 giây
- Render FPS >= 24 trên desktop, >= 20 trên mobile
- Model 3D load time < 2 giây
- Webcam access success rate > 95% (trừ trường hợp user deny)

- **Business Metrics** (sau khi deploy):

- Tăng conversion rate 15-20% cho sản phẩm có virtual try-on
- Giảm bounce rate 10% trên trang chi tiết kính
- 30% users thử ít nhất 1 mẫu kính khi vào trang sản phẩm

- **User Experience**:
- Model 3D tracking chính xác khi quay đầu (test manual)
- Không có jank/lag khi switch giữa các mẫu kính
- UI responsive trên mobile + desktop
- Accessibility: keyboard navigation + screen reader support

### Acceptance Criteria

- [ ] 7 model kính 3D được seed vào database với tên rõ ràng
- [ ] Frontend có page `/products/:id/try-on` hoạt động đầy đủ
- [ ] API `POST /try-on-history` lưu lịch sử thành công
- [ ] API `GET /products?hasVirtualTryOn=true` filter đúng
- [ ] Unit test coverage >= 80%
- [ ] Manual testing pass trên Chrome, Safari, Firefox
- [ ] HTTPS required (webcam access)

## Constraints & Assumptions

### Technical Constraints

- **Browser Support**: Chrome 90+, Safari 14+, Firefox 88+ (do WebRTC + WebGL)
- **HTTPS Required**: Webcam API chỉ hoạt động qua HTTPS
- **Model Size**: File GLTF + textures mỗi model < 5MB để load nhanh
- **Database**: PostgreSQL với JSON field cho 3D model config
- **Storage**: MinIO S3 (local Docker) để lưu GLTF files + textures

### Business Constraints

- **Phase 1 Priority**: End-user experience trước, admin sau
- **Timeline**: Ưu tiên MVP trong 2-3 tuần
- **Resources**: Solo developer, cần reuse code từ reference project

### Assumptions

- Backend có sẵn Product entity, chỉ cần extend thêm fields
- MinIO S3 đã được setup trong Docker (không cần setup mới)
- 7 model 3D từ reference project có license CC-BY-4.0 (commercial use OK)
- User đã đăng nhập khi muốn lưu lịch sử (không cần cho guest users)
- Frontend có sẵn auth context và API client setup
- Không cần mobile native app, chỉ focus responsive web

## Questions & Open Items

### Resolved

- ~~Admin management UI?~~ → Để phase 2
- ~~Model 3D lưu ở đâu?~~ → MinIO S3 local Docker
- ~~Tên sản phẩm seed data?~~ → Tên rõ ràng như "Kính Thể Thao B307", "Kính Aviator"

### Open Items 🔄

1. **Backend Product Schema**: Có sẵn entity `Product` chưa? Cần extend thêm fields nào?

   - `virtualTryOnConfig: JSON` (chứa x, y, z, scale, up, modelPath)
   - `has3DModel: boolean`

2. **Authentication**: Try-on history có yêu cầu login không? Hay cho phép guest + prompt login khi muốn save?

   - **Decision needed**: Bắt buộc login hoặc optional với localStorage fallback?

3. **Image Upload for Screenshot**: Ảnh chụp khi thử kính có lưu vào backend không?

   - **Option A**: Chỉ download về máy (không lưu backend) → Đơn giản hơn
   - **Option B**: Upload lên backend, link với user profile → Phức tạp hơn

4. **Browser Compatibility Testing**: Có test trên Safari iOS không?

   - Safari iOS yêu cầu HTTPS strict + permission handling khác

5. **CDN for TensorFlow.js**: Có tự host hay dùng unpkg CDN?
   - Reference code dùng unpkg, nhưng có thể slow cho users ở VN

### Items Requiring Research

- [ ] Three.js version compatibility với Next.js 14 App Router
- [ ] TensorFlow.js Facemesh model có version mới hơn không? (reference dùng @0.0.1)
- [ ] Performance optimization cho mobile devices (GPU acceleration)
- [ ] CORS configuration cho MinIO S3 serving GLTF files

---

**Next Steps**:

1. Review requirements với stakeholder/product owner
2. Clarify open items (đặc biệt về Product schema)
3. Proceed to Design phase → `feature-virtual-glasses-try-on-design.md`
