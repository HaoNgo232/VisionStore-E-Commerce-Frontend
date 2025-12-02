---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
feature: glasses-try-on-simple
---

# Requirements & Problem Understanding - Glasses Try-On Simple

## Problem Statement

**What problem are we solving?**

- **Core Problem**: Khách hàng không thể thử kính trước khi mua hàng online, dẫn đến do dự và tỷ lệ mua hàng thấp. Cần một giải pháp đơn giản, nhanh chóng để demo tính năng thử kính.
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

- Cho phép khách hàng chụp ảnh khuôn mặt qua webcam và thử kính ảo (AR overlay) trực tiếp trên ảnh
- Tăng trải nghiệm mua sắm và tỷ lệ chuyển đổi (conversion rate)
- Giải pháp đơn giản, dễ demo, không cần login để thử kính
- Frontend tự xử lý face detection và overlay (không cần backend xử lý)

### Secondary Goals

- Cho phép chụp ảnh khi thử kính để lưu lại hoặc chia sẻ
- Tạo điểm khác biệt cạnh tranh cho nền tảng
- Hỗ trợ nhiều loại kính (ảnh PNG với nền trong suốt)

### Non-Goals (Out of Scope)

- Real-time webcam overlay (chỉ cần chụp ảnh rồi overlay)
- 3D models rendering (chỉ dùng ảnh 2D PNG)
- Lưu lịch sử thử kính (không cần login)
- Social sharing features phức tạp (chỉ cần download ảnh)
- AR trên mobile native app (chỉ focus web-based)
- Backend xử lý face detection (frontend tự xử lý)

## User Stories & Use Cases

### 👤 Customer Stories (Priority: HIGH)

#### US-1: Chụp Ảnh Khuôn Mặt Qua Webcam

**As a** khách hàng muốn thử kính  
**I want to** truy cập camera và chụp ảnh khuôn mặt của tôi  
**So that** tôi có thể thử kính trên ảnh của mình

**Acceptance Criteria:**

- [ ] Có nút "Bắt đầu thử kính" trên trang sản phẩm
- [ ] Click vào nút → mở modal với webcam preview
- [ ] Có hướng dẫn đặt khuôn mặt trong khung
- [ ] Có nút "Chụp ảnh" để capture
- [ ] Sau khi chụp, hiển thị ảnh đã chụp
- [ ] Có nút "Chụp lại" nếu không hài lòng

#### US-2: Chọn Kính Để Thử

**As a** khách hàng đã chụp ảnh  
**I want to** chọn kính từ danh sách sản phẩm  
**So that** tôi có thể xem kính đó trông như thế nào trên khuôn mặt

**Acceptance Criteria:**

- [ ] Sau khi chụp ảnh, hiển thị danh sách kính có thể thử
- [ ] Mỗi kính có thumbnail và tên sản phẩm
- [ ] Click vào kính → overlay kính lên ảnh khuôn mặt
- [ ] Kính được đặt đúng vị trí mắt (dựa trên face detection)
- [ ] Có thể chuyển đổi giữa các kính khác nhau

#### US-3: Xem Kết Quả Và Tải Ảnh

**As a** khách hàng đã thử kính  
**I want to** xem ảnh kết quả và tải về máy  
**So that** tôi có thể lưu lại hoặc chia sẻ với người khác

**Acceptance Criteria:**

- [ ] Hiển thị ảnh kết quả với kính đã overlay
- [ ] Có nút "Tải ảnh" để download về máy
- [ ] Ảnh được lưu với tên file có ý nghĩa (ví dụ: `tryon-{product-name}-{timestamp}.png`)
- [ ] Có thể thử kính khác mà không cần chụp lại ảnh

### 🔧 Technical Stories (Priority: MEDIUM)

#### TS-1: Face Detection Integration

**As a** developer  
**I want to** tích hợp face detection library (face-api.js hoặc MediaPipe)  
**So that** có thể xác định vị trí mắt để overlay kính chính xác

**Acceptance Criteria:**

- [ ] Load face detection model khi mở modal
- [ ] Detect face landmarks từ ảnh đã chụp
- [ ] Extract tọa độ mắt trái/phải
- [ ] Xử lý trường hợp không detect được face (hiển thị thông báo)

#### TS-2: Glasses Overlay Engine

**As a** developer  
**I want to** tạo engine overlay kính lên ảnh khuôn mặt  
**So that** kính được đặt đúng vị trí, scale và rotation phù hợp

**Acceptance Criteria:**

- [ ] Load ảnh kính (PNG với nền trong suốt) từ backend
- [ ] Tính toán vị trí overlay dựa trên tọa độ mắt
- [ ] Tính toán scale dựa trên khoảng cách giữa 2 mắt
- [ ] Tính toán rotation dựa trên góc nghiêng của khuôn mặt
- [ ] Render overlay lên canvas

#### TS-3: Backend Assets API

**As a** developer  
**I want to** backend cung cấp API để lấy danh sách kính và ảnh kính  
**So that** frontend có thể load assets để overlay

**Acceptance Criteria:**

- [ ] API endpoint: `GET /api/products?hasTryOn=true` - lấy danh sách kính
- [ ] Mỗi product có field `tryOnImageUrl` (URL ảnh PNG kính)
- [ ] Ảnh kính được lưu trên MinIO hoặc CDN
- [ ] CORS được cấu hình đúng để frontend load được

## Success Criteria

**How will we know when we're done?**

### Functional Success Criteria

- [ ] Người dùng có thể chụp ảnh khuôn mặt qua webcam
- [ ] Người dùng có thể chọn kính từ danh sách
- [ ] Kính được overlay chính xác trên vị trí mắt (accuracy > 90%)
- [ ] Người dùng có thể tải ảnh kết quả về máy
- [ ] Tính năng hoạt động trên Chrome, Firefox, Safari (desktop)
- [ ] Tính năng hoạt động trên mobile browsers (iOS Safari, Chrome Mobile)

### Performance Success Criteria

- [ ] Face detection model load trong < 3 giây
- [ ] Face detection trên ảnh trong < 1 giây
- [ ] Overlay rendering trong < 500ms
- [ ] Tổng thời gian từ chụp ảnh đến hiển thị kết quả < 5 giây

### User Experience Success Criteria

- [ ] UI/UX rõ ràng, dễ sử dụng
- [ ] Có loading states và error messages rõ ràng
- [ ] Hỗ trợ responsive design (mobile + desktop)
- [ ] Không cần login để sử dụng tính năng

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints

- **Browser APIs**: Phụ thuộc vào `getUserMedia` API (cần HTTPS hoặc localhost)
- **Face Detection Library**: Cần chọn giữa face-api.js (nhẹ hơn) hoặc MediaPipe (chính xác hơn)
- **Image Format**: Kính phải là PNG với nền trong suốt
- **Backend**: Chỉ cần serve assets, không cần xử lý face detection

### Business Constraints

- **Time**: Cần demo nhanh, ưu tiên giải pháp đơn giản
- **Budget**: Sử dụng open-source libraries (không trả phí)
- **Scope**: Chỉ demo, không cần production-ready ngay

### Assumptions

- Người dùng có webcam và cho phép truy cập
- Người dùng có kết nối internet để load face detection model
- Backend đã có sẵn ảnh kính (PNG) cho các sản phẩm
- Browser hỗ trợ Canvas API và WebGL (cho face detection)

## Questions & Open Items

**What do we still need to clarify?**

### Technical Questions

- [ ] **Q1**: Chọn face detection library nào?

  - Option A: face-api.js (nhẹ, dễ tích hợp, model nhỏ ~2MB)
  - Option B: MediaPipe Face Detection (chính xác hơn, model lớn hơn ~10MB)
  - **Recommendation**: face-api.js cho demo (đơn giản, đủ chính xác)

- [ ] **Q2**: Format ảnh kính từ backend?

  - Option A: PNG với nền trong suốt (recommended)
  - Option B: SVG (có thể scale tốt hơn nhưng phức tạp hơn)
  - **Recommendation**: PNG với nền trong suốt

- [ ] **Q3**: Có cần cache face detection model không?
  - **Answer**: Có, cache trong IndexedDB để tăng tốc lần sau

### Product Questions

- [ ] **Q4**: Có cần hỗ trợ upload ảnh từ máy không? (ngoài webcam)

  - **Recommendation**: Có, thêm option "Upload ảnh" để linh hoạt hơn

- [ ] **Q5**: Có cần preview real-time khi chọn kính không?
  - **Recommendation**: Không cần (chỉ cần overlay sau khi chọn)

### Backend Questions

- [ ] **Q6**: Backend API structure cho try-on assets?
  - **Answer**: Cần thêm field `tryOnImageUrl` vào Product model
  - **Answer**: Cần endpoint `GET /api/products?hasTryOn=true`
