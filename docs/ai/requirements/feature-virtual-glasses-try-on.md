---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement

**What problem are we solving?**

Khách hàng online không thể thử kính trước khi mua, dẫn đến:

- Tỷ lệ trả hàng cao do kính không vừa hoặc không phù hợp với khuôn mặt
- Khách hàng do dự khi quyết định mua vì không biết kính trông như thế nào khi đeo
- Giảm conversion rate và doanh số bán hàng online

**Who is affected by this problem?**

- Khách hàng cuối (end users) đang tìm mua kính online
- Người dùng trên desktop browsers (Chrome)
- Business: Mất cơ hội bán hàng và tăng chi phí xử lý trả hàng

**What is the current situation/workaround?**

- Khách hàng chỉ xem được ảnh sản phẩm trên model hoặc mannequin
- Không có cách nào để visualize kính trên khuôn mặt của chính họ
- Phải đến cửa hàng vật lý để thử kính (không khả thi với mua online)

## Goals & Objectives

**What do we want to achieve?**

**Primary Goals:**

- Cho phép người dùng upload ảnh selfie và xem kính overlay trên ảnh của họ
- Tăng tỷ lệ chuyển đổi mua hàng (conversion rate)
- Giảm tỷ lệ trả hàng do không vừa/không phù hợp

**Secondary Goals:**

- Tạo trải nghiệm mua sắm interactive và engaging
- Thu thập data về sở thích kính của người dùng
- Tăng thời gian người dùng ở lại trên website

**Non-Goals (Out of Scope):**

- Real-time webcam try-on (chỉ làm static image)
- Multi-face detection (chỉ detect 1 khuôn mặt)
- Advanced AR features (animation, lighting effects, etc.)
- Hỗ trợ browsers khác ngoài Chrome desktop
- Tối ưu cho kết nối mạng chậm (có thể làm sau)

## User Stories & Use Cases

**How will users interact with the solution?**

### User Story 1: Upload và Thử Kính

```
Là một khách hàng,
Tôi muốn upload ảnh selfie của mình,
Để xem các mẫu kính trông như thế nào trên khuôn mặt tôi.
```

**Acceptance Criteria:**

- Người dùng có thể upload ảnh từ device (JPEG, PNG, max 10MB)
- Hệ thống detect khuôn mặt trong ảnh tải lên
- Hiển thị thông báo lỗi nếu không detect được khuôn mặt hoặc có nhiều hơn 1 khuôn mặt
- Ảnh được preview trước khi xử lý

### User Story 2: Lựa Chọn Kính

```
Là một khách hàng,
Tôi muốn chọn từ danh sách các mẫu kính có sẵn,
Để thử nhiều kiểu khác nhau và tìm mẫu phù hợp nhất.
```

**Acceptance Criteria:**

- Hiển thị danh sách các mẫu kính với thumbnail
- Click vào kính để overlay lên ảnh đã upload
- Switch giữa các mẫu kính smoothly (không cần re-upload ảnh)
- Hiển thị tên và thông tin cơ bản của mỗi mẫu kính

### User Story 3: Lưu và Chia Sẻ

```
Là một khách hàng,
Tôi muốn lưu hoặc chia sẻ ảnh tôi đang đeo kính ảo,
Để hỏi ý kiến bạn bè hoặc so sánh các mẫu sau này.
```

**Acceptance Criteria:**

- Nút "Download" để tải ảnh kết quả về máy (PNG format)
- Nút "Share" để copy link hoặc share lên social media (optional)
- Ảnh được lưu trên server với unique URL (optional, cho share feature)

### User Story 4: Thêm Vào Giỏ Hàng

```
Là một khách hàng,
Sau khi thử kính và hài lòng,
Tôi muốn thêm mẫu kính đó vào giỏ hàng ngay lập tức.
```

**Acceptance Criteria:**

- Nút "Add to Cart" hiển thị rõ ràng khi đang try-on
- Click vào sẽ thêm sản phẩm vào giỏ hàng
- Hiển thị confirmation message
- Link đến giỏ hàng hoặc checkout page

### Edge Cases to Consider:

- Ảnh không có khuôn mặt hoặc khuôn mặt bị che khuất (mặt nạ, tóc che mắt)
- Ảnh có nhiều hơn 1 khuôn mặt
- Ảnh có góc chụp nghiêng quá mức (profile, looking down/up)
- Ảnh quá tối hoặc quá sáng
- File size quá lớn hoặc format không hỗ trợ
- Kính bị lệch hoặc không vừa với khuôn mặt (adjustment needed)

## Success Criteria

**How will we know when we're done?**

### Functional Success Criteria:

- [ ] Người dùng có thể upload ảnh và nhận được kết quả trong < 5 giây
- [ ] Face detection accuracy: >90% với ảnh selfie chuẩn (frontal face, good lighting)
- [ ] Kính được overlay đúng vị trí (trên mũi, ngang mắt) với sai số < 5% kích thước khuôn mặt
- [ ] Người dùng có thể switch giữa ít nhất 7 mẫu kính (có sẵn trong 3dmodel folder)
- [ ] Có thể download ảnh kết quả (PNG, resolution giữ nguyên)
- [ ] Tích hợp với giỏ hàng (add to cart từ try-on page)

### Performance Benchmarks:

- Face detection + rendering: < 3 giây (Chrome desktop)
- 3D model loading: < 2 giây per model
- Switching giữa các mẫu kính: < 1 giây
- Image download generation: < 2 giây

### User Experience Criteria:

- Interface trực quan, dễ sử dụng (không cần hướng dẫn)
- Responsive feedback khi user thao tác (loading states, error messages)
- Ảnh kết quả trông realistic (không bị lệch, méo, hoặc scale sai)

### Business Metrics (để đo sau khi deploy):

- Tăng conversion rate ít nhất 5% cho users sử dụng try-on
- Giảm return rate ít nhất 10% cho orders có sử dụng try-on
- Usage rate: >30% khách hàng xem trang sản phẩm kính sử dụng tính năng try-on

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints:

- Chỉ hỗ trợ Chrome desktop (không cần cross-browser compatibility ngay)
- Client-side processing (JavaScript + WebGL)
- MediaPipe Face Landmarker API phải hoạt động ổn định
- GLB 3D models có sẵn trong folder `3dmodel/` (7 models)
- Backend có MinIO S3 để store 3D models và user images

### Business Constraints:

- Không cần authentication (public feature, guest users OK)
- Không cần real-time webcam (static image only)
- Single face detection (không xử lý group photos)

### Assumptions:

- Người dùng upload ảnh selfie chất lượng tốt (frontal face, good lighting)
- 3D models đã được chuẩn bị sẵn và có cùng format/scale
- Backend API endpoint sẽ được tạo để:
  - Serve 3D models từ MinIO S3
  - Lưu ảnh user upload (optional, cho share feature)
  - Lưu ảnh kết quả (optional, cho share feature)
- Frontend đã có product management system để integrate "Add to Cart"

### Data Privacy:

- Ảnh user upload không được lưu trữ lâu dài (trừ khi user chọn "save")
- Tuân thủ GDPR/privacy regulations về xử lý biometric data
- User có quyền xóa ảnh đã lưu

## Questions & Open Items

**What do we still need to clarify?**

### Resolved:

- ✅ Technology stack: MediaPipe + Three.js
- ✅ 3D models: GLB format, có sẵn
- ✅ Authentication: Không cần
- ✅ Scope: Static image only

### Unresolved Questions:

- **Backend API endpoints:** Cần define API spec cho:

  - `GET /api/glasses/models` - List available 3D models
  - `GET /api/glasses/models/:id` - Download specific GLB file
  - `POST /api/glasses/try-on/save` - Save try-on result (optional)
  - Schema cho Product model có cần thêm field `glassesModelUrl`?

- **Admin Features:** Khi admin tạo/update sản phẩm kính:

  - Upload 3D model file (GLB) lên MinIO S3
  - Liên kết model với product record
  - Validate model format/size

- **Product Integration:**

  - Try-on feature có ở trang nào? (Product detail page? Dedicated try-on page?)
  - Làm sao để navigate từ product listing → try-on?
  - Cart integration: Cần API nào để add product to cart?

- **Image Storage:**
  - Có cần lưu ảnh user upload không? (Privacy concern)
  - Share feature có cần implement không? (Nếu có, cần generate shareable links)
  - Ảnh download có cần watermark hoặc branding không?

### Research Needed:

- MediaPipe Face Landmarker performance với ảnh có lighting không tốt
- Three.js best practices cho overlay 3D glasses on 2D image
- Cách xử lý face angle/rotation để adjust kính cho đúng
