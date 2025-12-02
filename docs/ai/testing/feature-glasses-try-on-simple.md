---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: glasses-try-on-simple
---

# Testing Strategy - Glasses Try-On Simple

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of new/changed code (hooks, utils, services)
- **Integration test scope**: Critical paths (webcam → detect → overlay → result)
- **End-to-end test scenarios**: Key user journeys (complete try-on flow)
- **Alignment with requirements**: All acceptance criteria from requirements doc must be testable

## Unit Tests

### Component/Module 1: useWebcam Hook

**File**: `features/ar/hooks/use-webcam.spec.ts`

- [ ] **Test case 1.1**: `start - should request webcam access with correct constraints`

  - Setup: Mock `navigator.mediaDevices.getUserMedia`
  - Action: Call `start()`
  - Assert: `getUserMedia` called với video constraints (facingMode: 'user')
  - Assert: `isReady` becomes `true` after success

- [ ] **Test case 1.2**: `start - should handle permission denied error`

  - Setup: Mock `getUserMedia` to reject với `NotAllowedError`
  - Action: Call `start()`
  - Assert: `error` state set với correct error message
  - Assert: `isReady` remains `false`

- [ ] **Test case 1.3**: `start - should handle no camera available error`

  - Setup: Mock `getUserMedia` to reject với `NotFoundError`
  - Action: Call `start()`
  - Assert: `error` state set với correct error message

- [ ] **Test case 1.4**: `stop - should stop all media tracks`

  - Setup: Start webcam first (mock stream)
  - Action: Call `stop()`
  - Assert: All tracks `stop()` called
  - Assert: `isReady` becomes `false`

- [ ] **Test case 1.5**: `capture - should capture frame to image data URL`

  - Setup: Mock video element với `videoWidth`, `videoHeight`
  - Setup: Mock `drawImage` và `toDataURL` on canvas
  - Action: Call `capture()`
  - Assert: Returns base64 data URL
  - Assert: Canvas created với correct dimensions

- [ ] **Test case 1.6**: `capture - should return null if webcam not ready`
  - Setup: `isReady` is `false`
  - Action: Call `capture()`
  - Assert: Returns `null`

---

### Component/Module 2: useFaceDetector Hook

**File**: `features/ar/hooks/use-face-detector.spec.ts`

- [ ] **Test case 2.1**: `loadModels - should load face-api.js models on mount`

  - Setup: Mock `faceapi.nets.ssdMobilenetv1.loadFromUri`
  - Setup: Mock `faceapi.nets.faceLandmark68Net.loadFromUri`
  - Action: Render hook
  - Assert: Both models loaded
  - Assert: `isModelLoaded` becomes `true`

- [ ] **Test case 2.2**: `loadModels - should handle model load failure`

  - Setup: Mock `loadFromUri` to reject
  - Action: Render hook
  - Assert: `error` state set
  - Assert: `isModelLoaded` remains `false`

- [ ] **Test case 2.3**: `detectFace - should return face landmarks for detected face`

  - Setup: Mock face-api.js detection với landmarks
  - Setup: Mock image element
  - Action: Call `detectFace(image)`
  - Assert: Returns `FaceLandmarks` với leftEye, rightEye, confidence
  - Assert: Eye positions calculated correctly

- [ ] **Test case 2.4**: `detectFace - should return null when no face detected`

  - Setup: Mock face-api.js to return `null`
  - Setup: Mock image element
  - Action: Call `detectFace(image)`
  - Assert: Returns `null`

- [ ] **Test case 2.5**: `detectFace - should throw error when model not loaded`
  - Setup: `isModelLoaded` is `false`
  - Action: Call `detectFace(image)`
  - Assert: Throws error với message 'Face detection model not loaded'

---

### Component/Module 3: useGlassesOverlay Hook

**File**: `features/ar/hooks/use-glasses-overlay.spec.ts`

- [ ] **Test case 3.1**: `overlayGlasses - should load glasses image and render overlay`

  - Setup: Mock `loadImage` function
  - Setup: Mock face image và glasses image
  - Setup: Mock `calculateOverlayConfig` function
  - Setup: Mock canvas context và `drawImage`
  - Action: Call `overlayGlasses(faceImage, glassesUrl, landmarks)`
  - Assert: Glasses image loaded
  - Assert: Overlay config calculated
  - Assert: Canvas drawn với correct parameters
  - Assert: Returns blob URL

- [ ] **Test case 3.2**: `overlayGlasses - should handle image load failure`

  - Setup: Mock `loadImage` to reject
  - Action: Call `overlayGlasses(...)`
  - Assert: Throws error với message 'Failed to load image'

- [ ] **Test case 3.3**: `overlayGlasses - should handle canvas context failure`
  - Setup: Mock canvas `getContext` to return `null`
  - Action: Call `overlayGlasses(...)`
  - Assert: Throws error với message 'Failed to get canvas context'

---

### Component/Module 4: Overlay Utils

**File**: `features/ar/utils/overlay.utils.spec.ts`

- [ ] **Test case 4.1**: `calculateOverlayConfig - should calculate correct position`

  - Setup: Mock landmarks với known eye positions
  - Setup: Mock glasses image với known dimensions
  - Action: Call `calculateOverlayConfig(landmarks, glassesImage)`
  - Assert: Position is center between eyes
  - Assert: Scale calculated based on eye distance

- [ ] **Test case 4.2**: `calculateOverlayConfig - should handle edge cases`

  - Setup: Very close eyes (small distance)
  - Action: Call `calculateOverlayConfig(...)`
  - Assert: Scale is reasonable (not too small)

- [ ] **Test case 4.3**: `loadImage - should load image from URL`

  - Setup: Mock `Image` constructor
  - Action: Call `loadImage(url)`
  - Assert: Image `src` set to URL
  - Assert: Returns resolved image element

- [ ] **Test case 4.4**: `loadImage - should handle load failure`
  - Setup: Mock `Image` to trigger `onerror`
  - Action: Call `loadImage(url)`
  - Assert: Rejects với error message

---

### Component/Module 5: API Service

**File**: `features/ar/services/glasses-try-on.service.spec.ts`

- [ ] **Test case 5.1**: `getProductsWithTryOn - should fetch products with try-on`

  - Setup: Mock `BaseApiService.get` method
  - Setup: Mock response data
  - Action: Call `getProductsWithTryOn()`
  - Assert: API called với correct endpoint và query params
  - Assert: Returns validated response

- [ ] **Test case 5.2**: `getProductsWithTryOn - should handle pagination`

  - Setup: Mock API với pagination params
  - Action: Call `getProductsWithTryOn({ page: 2, pageSize: 10 })`
  - Assert: Query params include `page=2&pageSize=10`

- [ ] **Test case 5.3**: `getProductsWithTryOn - should validate response with Zod`
  - Setup: Mock invalid response data
  - Action: Call `getProductsWithTryOn()`
  - Assert: Throws validation error

---

## Integration Tests

### Integration Scenario 1: Complete Try-On Flow

**File**: `features/ar/__tests__/try-on-flow.integration.spec.ts`

- [ ] **Test case I1.1**: `Complete flow: capture → detect → overlay → result`

  - Setup: Mock webcam stream
  - Setup: Mock face detection (return landmarks)
  - Setup: Mock glasses image load
  - Action:
    1. Start webcam
    2. Capture image
    3. Detect face
    4. Select product
    5. Overlay glasses
    6. Get result
  - Assert: All steps complete successfully
  - Assert: Result image URL is valid

- [ ] **Test case I1.2**: `Flow with no face detected`

  - Setup: Mock face detection to return `null`
  - Action: Complete flow
  - Assert: Error message shown
  - Assert: User can retry

- [ ] **Test case I1.3**: `Flow with multiple products`
  - Setup: Mock multiple products
  - Action:
    1. Capture image
    2. Detect face
    3. Select product A → overlay
    4. Select product B → overlay
  - Assert: Both overlays work correctly
  - Assert: Result images are different

---

### Integration Scenario 2: Error Handling

**File**: `features/ar/__tests__/try-on-errors.integration.spec.ts`

- [ ] **Test case I2.1**: `Handle webcam permission denied`

  - Setup: Mock `getUserMedia` to reject với `NotAllowedError`
  - Action: Try to start webcam
  - Assert: Error message shown
  - Assert: Upload option available

- [ ] **Test case I2.2**: `Handle face detection failure`

  - Setup: Mock face detection to fail
  - Action: Try to detect face
  - Assert: Error message shown
  - Assert: User can retry với different image

- [ ] **Test case I2.3**: `Handle glasses image load failure`
  - Setup: Mock glasses image load to fail
  - Action: Try to overlay glasses
  - Assert: Error message shown
  - Assert: User can select different product

---

## End-to-End Tests

### User Flow 1: Successful Try-On

**File**: `e2e/glasses-try-on.spec.ts`

- [ ] **Test case E2E-1.1**: `User can complete try-on flow successfully`

  - Steps:
    1. Navigate to product detail page
    2. Click "Thử kính" button
    3. Grant webcam permission
    4. Wait for webcam preview
    5. Click "Chụp ảnh"
    6. Wait for face detection
    7. Select a product from carousel
    8. Wait for overlay
    9. Verify result image displayed
    10. Click "Tải ảnh"
    11. Verify download triggered
  - Assert: All steps complete without errors
  - Assert: Result image is correct

- [ ] **Test case E2E-1.2**: `User can try multiple glasses`
  - Steps:
    1. Complete try-on flow
    2. Click "Thử kính khác"
    3. Select different product
    4. Verify new result
  - Assert: Can switch between products
  - Assert: Results are different

---

### User Flow 2: Error Scenarios

**File**: `e2e/glasses-try-on-errors.spec.ts`

- [ ] **Test case E2E-2.1**: `User denied webcam permission`

  - Steps:
    1. Navigate to product detail page
    2. Click "Thử kính" button
    3. Deny webcam permission
  - Assert: Error message shown
  - Assert: Upload option available

- [ ] **Test case E2E-2.2**: `No face detected in image`
  - Steps:
    1. Start try-on flow
    2. Capture image without face (or with face not visible)
    3. Wait for detection
  - Assert: Error message shown
  - Assert: Can retry với new image

---

### User Flow 3: Mobile Experience

**File**: `e2e/glasses-try-on-mobile.spec.ts`

- [ ] **Test case E2E-3.1**: `Try-on works on mobile browser`

---

## Future Tests: Admin Try-On PNG Upload

> Các test này sẽ được thực hiện khi implement tính năng admin upload ảnh try-on.

### Unit Tests (Backend)

- [ ] **Test case A1.1**: `CreateProduct - upload try-on PNG`
  - Khi gửi request với file PNG hợp lệ → upload lên MinIO thành công → `attributes.tryOnImageUrl` và `tryOnKey` được set đúng.
- [ ] **Test case A1.2**: `UpdateProduct - replace try-on PNG`
  - Khi gửi file PNG mới → key/url mới được cập nhật, key/url cũ không còn được dùng.
- [ ] **Test case A1.3**: `Validation - reject non-PNG mimetype`
  - Gửi file JPEG/WebP → backend trả lỗi validation rõ ràng.

### Unit/Integration Tests (Frontend Admin)

- [ ] **Test case A2.1**: `Admin form - accept only PNG`
  - Input file chỉ cho phép chọn `image/png`, chọn loại khác → hiển thị lỗi.
- [ ] **Test case A2.2**: `Admin form - preview existing try-on image`
  - Khi product đã có `tryOnImageUrl` → hiển thị preview trong form edit.
- [ ] **Test case A2.3**: `Admin form - submit with PNG`
  - Gửi form với file PNG → đúng payload (multipart) được gửi tới endpoint.

### E2E Scenario: Try-On với sản phẩm mới được upload PNG

- [ ] **Test case A3.1**: `New product with try-on PNG appears in AR selector`
  - Tạo sản phẩm trong admin với ảnh try-on PNG.
  - Mở trang sản phẩm đó → nút "Thử kính trực tuyến" xuất hiện.
  - Mở Try-On Modal → sản phẩm xuất hiện trong `ProductSelector` và overlay hoạt động bình thường.
  - Steps:
    1. Open on mobile device (iOS Safari, Chrome Mobile)
    2. Complete try-on flow
  - Assert: Webcam works on mobile
  - Assert: UI is responsive
  - Assert: Touch interactions work

---

## Test Data

### Test Fixtures and Mocks

**Face Detection Mocks:**

```typescript
// test/fixtures/face-detection.mock.ts
export const mockFaceLandmarks: FaceLandmarks = {
  leftEye: { x: 200, y: 300 },
  rightEye: { x: 400, y: 300 },
  confidence: 0.95,
};

export const mockFaceDetectionResult = {
  detection: { score: 0.95 },
  landmarks: {
    getLeftEye: () => [
      { x: 180, y: 290 },
      { x: 200, y: 285 },
      { x: 220, y: 290 },
      { x: 220, y: 310 },
      { x: 200, y: 315 },
      { x: 180, y: 310 },
    ],
    getRightEye: () => [
      { x: 380, y: 290 },
      { x: 400, y: 285 },
      { x: 420, y: 290 },
      { x: 420, y: 310 },
      { x: 400, y: 315 },
      { x: 380, y: 310 },
    ],
  },
};
```

**Product Mocks:**

```typescript
// test/fixtures/products.mock.ts
export const mockProductWithTryOn: ProductWithTryOn = {
  id: "clxxx",
  name: "Kính Mát Ray-Ban",
  priceInt: 1500000,
  tryOnImageUrl: "https://example.com/glasses/rayban.png",
  imageUrls: ["https://example.com/products/rayban.jpg"],
};
```

**Image Mocks:**

```typescript
// test/fixtures/images.mock.ts
export function createMockImage(width = 800, height = 600): HTMLImageElement {
  const img = document.createElement("img");
  img.width = width;
  img.height = height;
  img.src = "data:image/png;base64,..."; // Mock base64
  return img;
}
```

### Seed Data Requirements

- **Test Images**:
  - Face images với various angles, lighting conditions
  - Glasses images (PNG với transparency)
- **Test Products**:
  - At least 3 products với `tryOnImageUrl`
  - Various glasses styles (sunglasses, reading glasses, etc.)

## Test Reporting & Coverage

### Coverage Commands and Thresholds

```bash
# Run tests with coverage
pnpm test -- --coverage

# Coverage threshold: 100% for new code
# Coverage report: coverage/lcov-report/index.html
```

### Coverage Gaps

**Files below 100% and rationale:**

- **Components**: May have lower coverage due to UI interactions (acceptable, focus on logic)
- **E2E Tests**: Manual testing for some edge cases (browser-specific issues)

### Manual Testing Outcomes

**Browser Compatibility Testing:**

- [ ] Chrome 90+ (desktop + mobile) - ✅ Pass
- [ ] Firefox 88+ (desktop + mobile) - ⏳ Pending
- [ ] Safari 14+ (desktop + iOS) - ⏳ Pending

**Device Testing:**

- [ ] Desktop (Windows, macOS, Linux) - ⏳ Pending
- [ ] Mobile (iOS, Android) - ⏳ Pending
- [ ] Tablet (iPad, Android tablet) - ⏳ Pending

## Manual Testing

### UI/UX Testing Checklist

**Webcam Capture:**

- [ ] Webcam preview displays correctly
- [ ] "Chụp ảnh" button works
- [ ] "Chụp lại" button works
- [ ] Loading state shows while starting webcam
- [ ] Error message shows if permission denied
- [ ] Upload option works as fallback

**Face Detection:**

- [ ] Loading state shows while loading models
- [ ] Face detection works với various face angles
- [ ] Error message shows if no face detected
- [ ] Can retry detection với different image

**Product Selection:**

- [ ] Product carousel scrolls correctly
- [ ] Selected product highlighted
- [ ] Product thumbnails load correctly
- [ ] Loading state shows while fetching products

**Overlay & Result:**

- [ ] Glasses overlay positioned correctly
- [ ] Glasses scale appropriate to face size
- [ ] Result image displays correctly
- [ ] "Tải ảnh" button triggers download
- [ ] Downloaded image is correct format (PNG)

**Accessibility:**

- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] ARIA labels present
- [ ] Screen reader compatible
- [ ] Focus management correct

### Browser/Device Compatibility

**Required Browsers:**

- Chrome 90+ ✅
- Firefox 88+ ⏳
- Safari 14+ ⏳

**Required Devices:**

- Desktop (1920x1080, 1366x768) ⏳
- Mobile (375x667, 414x896) ⏳
- Tablet (768x1024) ⏳

### Smoke Tests After Deployment

- [ ] Try-on flow works on production
- [ ] Models load from CDN/public folder
- [ ] API endpoints accessible
- [ ] Images load correctly
- [ ] No console errors

## Performance Testing

### Load Testing Scenarios

- [ ] **Model Loading**: Measure time to load face-api.js models

  - Target: < 3s first load, < 500ms cached
  - Actual: ⏳ Pending

- [ ] **Face Detection**: Measure time to detect face

  - Target: < 1s
  - Actual: ⏳ Pending

- [ ] **Overlay Rendering**: Measure time to render overlay

  - Target: < 500ms
  - Actual: ⏳ Pending

- [ ] **Total Flow**: Measure end-to-end time
  - Target: < 5s (capture → result)
  - Actual: ⏳ Pending

### Stress Testing Approach

- [ ] **Multiple Rapid Selections**: Select different products rapidly

  - Expected: No crashes, smooth transitions
  - Actual: ⏳ Pending

- [ ] **Large Images**: Test với very large images (10MB+)

  - Expected: Handles gracefully, may be slow but doesn't crash
  - Actual: ⏳ Pending

- [ ] **Memory Leaks**: Test for memory leaks after multiple try-ons
  - Expected: No memory leaks, cleanup works correctly
  - Actual: ⏳ Pending

## Bug Tracking

### Issue Tracking Process

- **Critical Bugs**: Fix immediately (blocking user flow)
- **High Priority**: Fix within 1 day (major UX issues)
- **Medium Priority**: Fix within 1 week (minor issues)
- **Low Priority**: Fix in next iteration (nice-to-have improvements)

### Bug Severity Levels

1. **Critical**: Feature completely broken (e.g., can't capture image)
2. **High**: Major functionality broken (e.g., overlay doesn't work)
3. **Medium**: Minor functionality broken (e.g., download doesn't work)
4. **Low**: UI/UX issues (e.g., button styling)

### Regression Testing Strategy

- **Before each release**: Run full test suite
- **After bug fixes**: Test related functionality + full flow
- **Before major changes**: Run E2E tests
