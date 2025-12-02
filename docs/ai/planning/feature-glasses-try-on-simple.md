---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
feature: glasses-try-on-simple
last-updated: 2024-12-02
status: Phase 1–3 Complete
---

# Project Planning & Task Breakdown - Glasses Try-On Simple

## Progress Summary

**Last Updated**: 2024-12-02  
**Status**: Phase 1–3 Complete ✅ (Foundation + Core Engine + Integration & Polish)

### Completed Tasks (13/13)

- ✅ Task 1.1: Install Dependencies
- ✅ Task 1.2: Type Definitions & Zod Schemas
- ✅ Task 1.3: API Service Layer
- ✅ Task 1.4: Component Structure Setup
- ✅ Task 2.1: Webcam Capture Component
- ✅ Task 2.2: Face Detection Integration
- ✅ Task 2.3: Glasses Overlay Engine
- ✅ Task 2.4: Try-On Modal Component
- ✅ Task 3.1: Product Selector Component (MVP)
- ✅ Task 3.2: Result Preview & Download (MVP)
- ✅ Task 3.3: Integration với Product Detail Page
- ✅ Task 3.4: UI/UX Polish
- ✅ Task 3.5: Error Handling & Edge Cases

### Key Deliverables Completed

- face-api.js installed and models downloaded
- Complete type system with Zod validation
- API service with React Query integration
- Component/hook/utility skeleton structure ready
- Full try-on flow (capture → detect face → select glasses → view/download result)
- Integrated try-on button on product detail page (only for products có `tryOnImageUrl`)

---

## Milestones

- [x] **Milestone 1: Foundation Setup** (Day 1-2) ✅ **COMPLETED**

  - Dependencies installed ✅
  - Type definitions created ✅
  - Basic component structure ready ✅

- [x] **Milestone 2: Core Features** (Day 3-5) ✅ **COMPLETED**

  - Webcam capture working
  - Face detection integrated
  - Glasses overlay working

- [x] **Milestone 3: Integration & Polish** (Day 6-7) ✅ **COMPLETED**
  - Product selector integrated
  - Download feature working
  - UI/UX polished (desktop + mobile-friendly modal, basic a11y)
  - Error handling & edge cases covered (model timeout, retry, no webcam, no face, overlay errors)

## Task Breakdown

### Phase 1: Foundation Setup (Days 1-2, ~8h effort)

#### Task 1.1: Install Dependencies ✅ **COMPLETED**

**Priority**: CRITICAL | **Effort**: 1h | **Owner**: Frontend

- [x] Install face-api.js:
  ```bash
  pnpm add face-api.js
  ```
- [x] Install types (if needed):
  ```bash
  pnpm add -D @types/face-api.js
  ```
- [x] Download face-api.js models (SSD MobileNet + Face Landmark 68):
  - Create `public/models/` directory
  - Download models từ face-api.js repository
  - Models: `ssd_mobilenetv1_model-weights_manifest.json`, `face_landmark_68_model-weights_manifest.json`
- [x] Verify models load correctly
  - Created download script: `scripts/download-face-api-models.sh`
  - Models verified in `public/models/` directory

**Dependencies**: None

**Notes**: face-api.js v0.22.2 installed. Models downloaded successfully. Created test script for model verification.

---

#### Task 1.2: Type Definitions & Zod Schemas ✅ **COMPLETED**

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [x] Create `features/ar/types/glasses-try-on.types.ts`:
  - `ProductWithTryOn` interface ✅
  - `FaceLandmarks` interface ✅
  - `GlassesOverlayConfig` interface ✅
  - `TryOnResult` interface ✅
- [x] Create Zod schemas:
  - `ProductWithTryOnSchema` ✅
  - `FaceLandmarksSchema` ✅
  - `GlassesOverlayConfigSchema` ✅
  - `TryOnResultSchema` ✅
  - `ProductsWithTryOnResponseSchema` ✅
- [x] Export inferred types ✅
- [x] Sync với backend DTOs (nếu có) ✅
  - Added `TryOnError` class với error codes
  - All types follow project conventions (CUID, etc.)

**Dependencies**: None

**Notes**: All types and schemas created with proper Zod validation. Error handling types included.

---

#### Task 1.3: API Service Layer ✅ **COMPLETED**

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [x] Create `features/ar/services/glasses-try-on.service.ts`:
  - Service class: `GlassesTryOnService` ✅
  - Method: `getProductsWithTryOn(query?)` → `Promise<ProductsWithTryOnResponse>` ✅
- [x] Add Zod validation cho responses ✅
  - Uses `apiGetValidated` với `ProductsWithTryOnResponseSchema`
- [x] Error handling với `ApiError` ✅
  - Follows project pattern (similar to `products.service.ts`)
- [x] Create React Query hooks:
  - `useProductsWithTryOn(query?)` ✅
  - Query key factory: `glassesTryOnKeys` ✅ (added to `lib/query-keys.ts`)

**Dependencies**: Task 1.2 (types)

**Notes**: Service follows project patterns. Fixed TypeScript type assertion issues. React Query hook created with proper caching (5min stale time).

---

#### Task 1.4: Component Structure Setup ✅ **COMPLETED**

**Priority**: MEDIUM | **Effort**: 3h | **Owner**: Frontend

- [x] Create component files (empty structure):
  - `features/ar/components/try-on-modal.tsx` ✅
  - `features/ar/components/webcam-capture.tsx` ✅
  - `features/ar/components/product-selector.tsx` ✅
  - `features/ar/components/result-preview.tsx` ✅
- [x] Create hook files:
  - `features/ar/hooks/use-face-detector.ts` ✅
  - `features/ar/hooks/use-glasses-overlay.ts` ✅
  - `features/ar/hooks/use-webcam.ts` ✅
- [x] Create utility files:
  - `features/ar/utils/face-detection.utils.ts` ✅
  - `features/ar/utils/overlay.utils.ts` ✅
- [x] Setup basic component props và structure ✅
  - All files have proper TypeScript interfaces
  - TODO comments for implementation guidance
  - Follows project patterns and conventions

**Dependencies**: Task 1.2 (types)

**Notes**: All skeleton files created with proper structure. Ready for implementation in Phase 2. Some lint warnings expected (unused vars in skeleton code).

---

### Phase 2: Core Features (Days 3-5, ~16h effort)

#### Task 2.1: Webcam Capture Component ✅ **COMPLETED**

**Priority**: CRITICAL | **Effort**: 4h | **Owner**: Frontend

- [x] Create `useWebcam` hook:
  - `start()` - Request webcam access
  - `stop()` - Release webcam
  - `capture()` - Capture frame to image
  - State: `isReady`, `isLoading`, `error`, `stream`
- [x] Create `WebcamCapture` component:
  - Video element với preview
  - "Chụp ảnh" button
  - "Chụp lại" button (sau khi capture)
  - Error handling: permission denied, no camera
  - Loading state
- [ ] Add option "Upload ảnh" (fallback nếu không có webcam)
- [ ] Test trên Chrome, Firefox, Safari

**API Usage**:

```typescript
const { videoRef, isReady, error, start, stop, capture } = useWebcam();

useEffect(() => {
  start();
  return () => stop();
}, []);
```

**Dependencies**: Task 1.4 (component structure)

---

#### Task 2.2: Face Detection Integration ✅ **COMPLETED**

**Priority**: CRITICAL | **Effort**: 5h | **Owner**: Frontend

- [x] Create `useFaceDetector` hook:
  - Load face-api.js model on mount (lazy load)
  - Cache model trong IndexedDB (optional, nice to have)
  - `detectFace(image)` → returns `FaceLandmarks | null`
  - State: `isModelLoaded`, `isLoading`, `error`
- [x] Create utility functions:
  - `loadFaceApiModels()` - Load SSD MobileNet + Face Landmark 68
  - `detectFaceLandmarks(image)` - Detect và extract landmarks
  - `extractEyePositions(landmarks)` - Get left/right eye positions
- [x] Error handling:
  - Model load fail → retry logic
  - No face detected → return null với error message
  - Multiple faces → use first face
- [ ] Optimize: Only detect when image is ready

**Implementation Notes**:

```typescript
import * as faceapi from "face-api.js";

// Load models
await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

// Detect
const detection = await faceapi.detectSingleFace(image).withFaceLandmarks();

if (!detection) return null;

const landmarks = detection.landmarks;
const leftEye = landmarks.getLeftEye();
const rightEye = landmarks.getRightEye();
```

**Dependencies**: Task 1.1 (models), Task 2.1 (captured image)

---

#### Task 2.3: Glasses Overlay Engine ✅ **COMPLETED**

**Priority**: CRITICAL | **Effort**: 5h | **Owner**: Frontend

- [x] Create `useGlassesOverlay` hook:
  - `overlayGlasses(faceImage, glassesImageUrl, landmarks)` → returns result image URL
  - Load glasses image từ URL
  - Calculate overlay config (position, scale, rotation)
  - Render overlay lên canvas
  - Export result image
- [x] Create utility functions:
  - `calculateOverlayConfig(landmarks, glassesImage)` - Tính position, scale, rotation
  - `renderOverlay(canvas, faceImage, glassesImage, config)` - Render overlay
  - `exportCanvasToImage(canvas)` - Export canvas to blob URL
- [x] Overlay algorithm:
  - Position: Trung điểm giữa 2 mắt
  - Scale: Dựa trên khoảng cách giữa 2 mắt
  - Rotation: Dựa trên góc nghiêng của khuôn mặt (optional, có thể skip cho đơn giản)
- [x] Error handling: Image load fail, render fail

**Overlay Algorithm** (simplified):

```typescript
// Calculate position (center between eyes)
const centerX = (leftEye.x + rightEye.x) / 2;
const centerY = (leftEye.y + rightEye.y) / 2;

// Calculate scale (based on eye distance)
const eyeDistance = Math.sqrt(
  Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2),
);
const scale = (eyeDistance / glassesImage.width) * 1.5; // Adjust multiplier

// Render
ctx.drawImage(
  glassesImage,
  centerX - (glassesImage.width * scale) / 2,
  centerY - (glassesImage.height * scale) / 2,
  glassesImage.width * scale,
  glassesImage.height * scale,
);
```

**Dependencies**: Task 2.2 (face detection), Task 1.3 (API service)

---

#### Task 2.4: Try-On Modal Component ✅ **COMPLETED**

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [x] Create `TryOnModal` component:
  - Modal overlay (full screen hoặc dialog)
  - Integrate `WebcamCapture` component
  - Integrate `ProductSelector` component (placeholder)
  - Integrate `ResultPreview` component (placeholder)
  - State management: step (capture → select → result)
  - Close button
- [x] Flow:
  1. Step 1: Webcam capture
  2. Step 2: Select glasses (sau khi detect face)
  3. Step 3: Show result
- [x] Loading states và error handling
- [x] Responsive design (mobile + desktop) _(đã hoàn thiện trong Task 3.4)_

**Component Structure**:

```tsx
<TryOnModal open={isOpen} onOpenChange={onOpenChange}>
  {step === "capture" && <WebcamCapture onCapture={handleCapture} />}
  {step === "select" && <ProductSelector onSelect={handleSelect} />}
  {step === "result" && <ResultPreview result={result} />}
</TryOnModal>
```

**Dependencies**: Task 2.1, Task 2.2, Task 2.3

---

### Phase 3: Integration & Polish (Days 6-7, ~12h effort)

#### Task 3.1: Product Selector Component ✅ **MVP COMPLETED**

**Priority**: HIGH | **Effort**: 3h | **Owner**: Frontend

- [x] Create `ProductSelector` component (MVP):
  - Fetch products với `useProductsWithTryOn()` ✅ (hook sử dụng trong TryOnModal)
  - Horizontal scrollable list (ScrollArea) ✅
  - Thumbnail images, name/price display, highlight selected ✅
  - Loading + error state ✅
- [x] On select: Trigger overlay với selected product
- [ ] Mobile-friendly carousel polish / swipe hỗ trợ _(optional, có thể làm sau)_

**Dependencies**: Task 1.3 (API service), Task 2.4 (modal)

---

#### Task 3.2: Result Preview & Download ✅ **MVP COMPLETED**

**Priority**: HIGH | **Effort**: 3h | **Owner**: Frontend

- [x] Create `ResultPreview` component:
  - Display original + result image ✅
  - "Tải ảnh" / "Thử kính khác" / "Chụp lại" actions ✅
- [x] Implement download functionality:
  - Convert blob URL to downloadable file
  - Filename: `tryon-{product-name}-{timestamp}.png`
  - Trigger browser download
- [ ] Optional: Share functionality (copy to clipboard, share API)

**Download Implementation**:

```typescript
function downloadImage(imageUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Dependencies**: Task 2.3 (overlay), Task 2.4 (modal)

---

#### Task 3.3: Integration với Product Detail Page ✅ **COMPLETED**

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [x] Add "Thử kính trực tuyến" button vào Product Detail Page
- [x] Open `TryOnModal` khi click button
- [x] Pre-select product nếu có `productId` prop
- [x] Handle case: Product không có `tryOnImageUrl` → ẩn nút

**Location**: `features/products/components/product-detail-content.tsx` (dùng `TryOnModal`)

**Dependencies**: Task 2.4 (modal)

---

#### Task 3.4: UI/UX Polish ✅ **COMPLETED**

**Priority**: MEDIUM | **Effort**: 2h | **Owner**: Frontend

- [x] Add loading spinners cho các async operations
- [x] Add error messages rõ ràng:
  - "Không thể truy cập webcam"
  - "Không tìm thấy khuôn mặt trong ảnh"
  - "Lỗi khi tải ảnh kính" (overlay/glasses load error)
- [x] Add success messages:
  - "Đã chụp ảnh thành công"
  - "Đã tải ảnh thành công" (bắt đầu download ảnh kết quả)
- [x] Improve mobile UX:
  - Gần full screen modal trên mobile (`w-[95vw]`, `max-h-[90vh]`, scroll nội dung)
  - Larger touch targets cho các nút chính
  - Swipe gestures _(chưa làm – optional, có thể bổ sung sau)_
- [x] Add accessibility:
  - ARIA labels cho các nút chính (chụp ảnh, thử kính khác, tải ảnh, v.v.)
  - Keyboard navigation (ESC to close) thông qua shadcn dialog
  - Focus management cơ bản từ dialog (focus trap)

**Dependencies**: All previous tasks

---

#### Task 3.5: Error Handling & Edge Cases ✅ **COMPLETED**

**Priority**: MEDIUM | **Effort**: 2h | **Owner**: Frontend

- [x] Handle edge cases:
  - No webcam available → Show clear error message (hướng dẫn dùng trình duyệt khác / upload ảnh sau này)
  - Permission denied → Show error message với instructions (NotAllowedError)
  - No face detected → Show error message với retry option
  - Multiple faces → Use first face (thông qua `detectSingleFace`)
  - Face too small/large → _(chưa warning riêng, có thể bổ sung sau nếu cần)_
  - Glasses image load fail → Show error, cho phép chọn kính khác / thử lại
- [x] Add retry logic cho failed operations (retry tải model qua `reloadModels`, người dùng có thể retry overlay/chọn kính khác)
- [x] Add timeout cho model loading (30s) trong `useFaceDetector`

**Dependencies**: All previous tasks

---

## Dependencies

### Task Dependencies

```
Task 1.1 (Dependencies) → Task 1.2 (Types) → Task 1.3 (API Service)
                                                      ↓
Task 1.4 (Component Structure) → Task 2.1 (Webcam) → Task 2.2 (Face Detection)
                                                              ↓
Task 2.3 (Overlay) ← Task 1.3 (API Service)          Task 2.4 (Modal)
                                                              ↓
Task 3.1 (Product Selector) → Task 3.2 (Result) → Task 3.3 (Integration)
                                                              ↓
Task 3.4 (Polish) ← Task 3.5 (Error Handling)
```

### External Dependencies

- **Backend API**: Cần endpoint `GET /api/products?hasTryOn=true` với field `tryOnImageUrl`
- **MinIO/CDN**: Cần ảnh kính (PNG) được upload và accessible
- **face-api.js Models**: Cần download models từ repository

### Team/Resource Dependencies

- **Frontend Developer**: 1 người, ~36h effort
- **Backend Developer**: Cần confirm API structure (optional, có thể mock)
- **Designer**: Optional, có thể dùng existing UI components

## Timeline & Estimates

### Total Effort: ~36 hours (4.5 days)

| Phase                         | Tasks   | Effort | Days |
| ----------------------------- | ------- | ------ | ---- |
| Phase 1: Foundation           | 4 tasks | 8h     | 1-2  |
| Phase 2: Core Features        | 4 tasks | 16h    | 3-5  |
| Phase 3: Integration & Polish | 5 tasks | 12h    | 6-7  |

### Suggested Timeline

- **Week 1**: Phase 1 + Phase 2 (Days 1-5)
- **Week 2**: Phase 3 (Days 6-7) + Testing + Bug fixes

### Buffer for Unknowns

- Model loading issues: +2h
- Browser compatibility fixes: +2h
- Performance optimization: +2h
- **Total buffer**: +6h

## Risks & Mitigation

### Technical Risks

| Risk                                  | Impact | Probability | Mitigation                                              |
| ------------------------------------- | ------ | ----------- | ------------------------------------------------------- |
| face-api.js model quá nặng, load chậm | High   | Medium      | Cache model trong IndexedDB, show loading state rõ ràng |
| Face detection không chính xác        | Medium | Medium      | Test với nhiều ảnh, adjust detection threshold          |
| Browser compatibility issues          | Medium | Low         | Test early trên Chrome, Firefox, Safari                 |
| Canvas rendering performance kém      | Low    | Low         | Optimize canvas size, use requestAnimationFrame         |

### Resource Risks

| Risk                      | Impact | Probability | Mitigation                                 |
| ------------------------- | ------ | ----------- | ------------------------------------------ |
| Backend API chưa ready    | Medium | Low         | Mock API responses, implement real API sau |
| Không có ảnh kính để test | Low    | Low         | Tạo sample images, hoặc dùng placeholder   |

### Dependency Risks

| Risk                                            | Impact | Probability | Mitigation                                 |
| ----------------------------------------------- | ------ | ----------- | ------------------------------------------ |
| face-api.js không hoạt động trên một số browser | Medium | Low         | Test early, có fallback plan (MediaPipe)   |
| Webcam permission denied                        | High   | Medium      | Show clear error message, allow upload ảnh |

## Resources Needed

### Team Members and Roles

- **Frontend Developer** (1 người): Implement toàn bộ feature
- **Backend Developer** (optional): Confirm API structure, provide sample data
- **QA Tester** (optional): Test trên nhiều browsers/devices

### Tools and Services

- **face-api.js**: Open-source library (free)
- **Next.js**: Already in project
- **React Query**: Already in project
- **Canvas API**: Native browser API
- **IndexedDB**: Native browser API (for model caching)

### Infrastructure

- **MinIO/CDN**: Để serve ảnh kính (backend responsibility)
- **HTTPS**: Required cho webcam access (development: localhost OK)

### Documentation/Knowledge

- face-api.js documentation: https://github.com/justadudewhohacks/face-api.js
- Canvas API documentation: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- getUserMedia API: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
