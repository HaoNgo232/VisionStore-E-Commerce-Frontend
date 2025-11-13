---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: virtual-glasses-try-on
---

# Testing Strategy - Virtual Glasses Try-On

## Test Coverage Goals

### Coverage Targets

- **Unit Tests**: 80%+ coverage cho new/changed code
- **Integration Tests**: All critical API endpoints + component interactions
- **E2E Tests**: 2-3 key user journeys
- **Manual Tests**: Cross-browser compatibility + UX validation

### Alignment với Requirements

- US-1: Thử kính qua webcam → E2E test + manual
- US-2: Chọn nhiều mẫu kính → Integration test
- US-3: Chụp ảnh → Unit test + manual
- US-4: Xem lịch sử → Integration test
- US-5: Filter sản phẩm → Unit + integration test

---

## Unit Tests

### Backend Unit Tests

#### Module 1: TryOnHistoryService

**File**: `backend/src/try-on-history/try-on-history.service.spec.ts`

- [ ] **Test case 1.1**: `saveTryOn - should create new record when first try`

  - Setup: Empty database
  - Action: Call `saveTryOn(userId, productId)`
  - Assert: Record created với `tryCount = 1`

- [ ] **Test case 1.2**: `saveTryOn - should increment tryCount when try again same day`

  - Setup: Existing record với `tryCount = 1` created today
  - Action: Call `saveTryOn(userId, productId)` again
  - Assert: `tryCount` updated to 2, `triedAt` updated

- [ ] **Test case 1.3**: `saveTryOn - should create new record when try different day`

  - Setup: Existing record created yesterday
  - Action: Call `saveTryOn(userId, productId)` today
  - Assert: New record created với `tryCount = 1`

- [ ] **Test case 1.4**: `getTryOnHistory - should return user's history ordered by date`

  - Setup: 3 records for user, 2 records for other user
  - Action: Call `getTryOnHistory(userId, limit: 50)`
  - Assert: Returns 3 records, ordered by `triedAt DESC`

- [ ] **Test case 1.5**: `getTryOnHistory - should respect pagination limit`

  - Setup: 100 records for user
  - Action: Call `getTryOnHistory(userId, limit: 20)`
  - Assert: Returns exactly 20 records

- [ ] **Test case 1.6**: `saveTryOn - should handle invalid productId`
  - Setup: Non-existent productId
  - Action: Call `saveTryOn(userId, invalidProductId)`
  - Assert: Throws NotFoundException

---

#### Module 2: ProductsService Extension

**File**: `backend/src/products/products.service.spec.ts`

- [ ] **Test case 2.1**: `getProductById - should include virtualTryOnConfig`

  - Setup: Product với `hasVirtualTryOn = true`
  - Action: Call `getProductById(id)`
  - Assert: Response includes populated `virtualTryOnConfig`

- [ ] **Test case 2.2**: `getProductById - should transform modelPath to presigned URL`

  - Setup: Product với `virtualTryOnConfig.modelPath = "3d-models/glasses-01/scene.gltf"`
  - Action: Call `getProductById(id)`
  - Assert: Response `virtualTryOnConfig.modelPath` starts with `https://minio`

- [ ] **Test case 2.3**: `getProducts - should filter by hasVirtualTryOn`

  - Setup: 5 products với `hasVirtualTryOn = true`, 5 với `false`
  - Action: Call `getProducts({ hasVirtualTryOn: true })`
  - Assert: Returns only 5 products với virtual try-on

- [ ] **Test case 2.4**: `getProducts - should not filter when param not provided`
  - Setup: Same as 2.3
  - Action: Call `getProducts({})` without filter
  - Assert: Returns all 10 products

---

#### Module 3: MinioService

**File**: `backend/src/minio/minio.service.spec.ts`

- [ ] **Test case 3.1**: `uploadGLTFModel - should upload file to bucket`

  - Setup: Mock MinIO client
  - Action: Call `uploadGLTFModel(buffer, productId, 'scene.gltf')`
  - Assert: `putObject` called with correct params

- [ ] **Test case 3.2**: `getPresignedUrl - should generate valid URL`

  - Setup: Mock MinIO client
  - Action: Call `getPresignedUrl('3d-models/glasses-01/scene.gltf')`
  - Assert: Returns URL với expiry timestamp

- [ ] **Test case 3.3**: `uploadGLTFModel - should handle upload failure`
  - Setup: Mock MinIO client to throw error
  - Action: Call `uploadGLTFModel(...)`
  - Assert: Throws InternalServerErrorException

---

### Frontend Unit Tests

#### Module 4: WebcamManager

**File**: `frontend/src/features/virtual-try-on/lib/webcam-manager.spec.ts`

- [ ] **Test case 4.1**: `start - should request user media with correct constraints`

  - Setup: Mock `navigator.mediaDevices.getUserMedia`
  - Action: Call `start(videoElement)`
  - Assert: `getUserMedia` called với video constraints

- [ ] **Test case 4.2**: `start - should throw PERMISSION_DENIED on NotAllowedError`

  - Setup: Mock `getUserMedia` to reject với `NotAllowedError`
  - Action: Call `start(videoElement)`
  - Assert: Throws error với message 'PERMISSION_DENIED'

- [ ] **Test case 4.3**: `stop - should stop all media tracks`

  - Setup: Start webcam first
  - Action: Call `stop()`
  - Assert: All tracks `stop()` called

- [ ] **Test case 4.4**: `flip - should switch facing mode`
  - Setup: Start với `facingMode: 'user'`
  - Action: Call `flip()`
  - Assert: Stops old stream, starts new với `facingMode: 'environment'`

---

#### Module 5: FacemeshDetector

**File**: `frontend/src/features/virtual-try-on/lib/facemesh-detector.spec.ts`

- [ ] **Test case 5.1**: `loadModel - should load TensorFlow model`

  - Setup: Mock `faceLandmarksDetection.load`
  - Action: Call `loadModel()`
  - Assert: `load` called with correct package

- [ ] **Test case 5.2**: `detectFaces - should return keypoints for detected face`

  - Setup: Mock model với fake predictions
  - Action: Call `detectFaces(videoElement)`
  - Assert: Returns array với correct keypoints structure

- [ ] **Test case 5.3**: `detectFaces - should return empty array when no face`

  - Setup: Mock model to return empty predictions
  - Action: Call `detectFaces(videoElement)`
  - Assert: Returns `[]`

- [ ] **Test case 5.4**: `detectFaces - should throw error when model not loaded`
  - Setup: Don't call `loadModel()`
  - Action: Call `detectFaces(videoElement)`
  - Assert: Throws error

---

#### Module 6: GLTFModelLoader

**File**: `frontend/src/features/virtual-try-on/lib/gltf-loader.spec.ts`

- [ ] **Test case 6.1**: `load - should load GLTF model from URL`

  - Setup: Mock `GLTFLoader.load`
  - Action: Call `load('https://example.com/model.gltf')`
  - Assert: `GLTFLoader.load` called với URL

- [ ] **Test case 6.2**: `load - should cache loaded models`

  - Setup: Mock loader
  - Action: Call `load(url)` twice với same URL
  - Assert: Loader only called once, second call returns cached

- [ ] **Test case 6.3**: `load - should reject on load error`
  - Setup: Mock loader to fail
  - Action: Call `load(invalidUrl)`
  - Assert: Promise rejects

---

#### Module 7: TrackingCalculator

**File**: `frontend/src/features/virtual-try-on/lib/tracking-calculator.spec.ts`

- [ ] **Test case 7.1**: `calculateGlassesTransform - should calculate correct position`

  - Setup: Mock keypoints với known values
  - Action: Call `calculateGlassesTransform(keypoints, config)`
  - Assert: Returns position matching expected math

- [ ] **Test case 7.2**: `calculateGlassesTransform - should normalize up vector`

  - Setup: Mock keypoints
  - Action: Call function
  - Assert: `upVector` has length = 1 (normalized)

- [ ] **Test case 7.3**: `calculateGlassesTransform - should scale based on eye distance`
  - Setup: Mock keypoints với leftEye distance 100px từ rightEye
  - Action: Call function với `config.scale = 0.5`
  - Assert: Returns `scale = 50`

---

#### Module 8: VirtualTryOnService (API)

**File**: `frontend/src/services/virtual-try-on.service.spec.ts`

- [ ] **Test case 8.1**: `getProductForTryOn - should validate response với Zod`

  - Setup: Mock fetch với valid product response
  - Action: Call `getProductForTryOn(productId)`
  - Assert: Returns validated product

- [ ] **Test case 8.2**: `getProductForTryOn - should throw on invalid response`

  - Setup: Mock fetch với invalid data (missing fields)
  - Action: Call `getProductForTryOn(productId)`
  - Assert: Throws ZodError

- [ ] **Test case 8.3**: `saveTryOnHistory - should send POST request`

  - Setup: Mock fetch
  - Action: Call `saveTryOnHistory(productId)`
  - Assert: POST called với correct body

- [ ] **Test case 8.4**: `getTryOnHistory - should return validated array`
  - Setup: Mock fetch với array of history items
  - Action: Call `getTryOnHistory()`
  - Assert: Returns array validated với Zod schema

---

## Integration Tests

### Backend Integration Tests

#### Integration Scenario 1: Complete Try-On Flow

**File**: `backend/test/try-on-flow.e2e-spec.ts`

- [ ] **Test**: User tries glasses và saves history

  - Step 1: Create test user + product với virtual try-on
  - Step 2: POST `/api/try-on-history` với JWT token
  - Step 3: GET `/api/try-on-history` to verify saved
  - Assert: History item exists với correct data

- [ ] **Test**: User tries same glasses twice in one day
  - Step 1: POST `/api/try-on-history` first time
  - Step 2: POST again với same productId
  - Step 3: GET history
  - Assert: Only 1 record, `tryCount = 2`

---

#### Integration Scenario 2: Product Virtual Try-On API

**File**: `backend/test/products-virtual-tryon.e2e-spec.ts`

- [ ] **Test**: Get product with try-on config

  - Step 1: Seed product với `hasVirtualTryOn = true`
  - Step 2: GET `/api/products/:id`
  - Assert: Response includes `virtualTryOnConfig` với presigned URL

- [ ] **Test**: Filter products by hasVirtualTryOn

  - Step 1: Seed 3 products với try-on, 2 without
  - Step 2: GET `/api/products?hasVirtualTryOn=true`
  - Assert: Returns 3 products only

- [ ] **Test**: Presigned URL is accessible
  - Step 1: Get product với try-on config
  - Step 2: Extract `modelPath` URL
  - Step 3: Fetch URL
  - Assert: Returns 200, content-type = model/gltf+json

---

### Frontend Integration Tests

#### Integration Scenario 3: Virtual Try-On Modal Flow

**File**: `frontend/src/features/virtual-try-on/components/VirtualTryOnModal.integration.spec.tsx`

- [ ] **Test**: Complete modal workflow

  - Step 1: Render modal với mock product
  - Step 2: Mock webcam grant permission
  - Step 3: Mock facemesh detection returns landmarks
  - Step 4: Verify canvas renders
  - Step 5: Click "Chụp Ảnh"
  - Assert: Screenshot download triggered

- [ ] **Test**: Model selection updates render

  - Step 1: Render modal với 3 models
  - Step 2: Wait for first model to load
  - Step 3: Click second model thumbnail
  - Step 4: Wait for load
  - Assert: Scene updated với new model

- [ ] **Test**: Error handling - permission denied
  - Step 1: Render modal
  - Step 2: Mock webcam permission denied
  - Assert: Error message displayed với instruction

---

#### Integration Scenario 4: API Integration Flow

**File**: `frontend/src/services/virtual-try-on.integration.spec.ts` (uses MSW)

- [ ] **Test**: Fetch product and display try-on button

  - Step 1: Mock API `/api/products/123` returns product với `hasVirtualTryOn = true`
  - Step 2: Render product page
  - Assert: "Thử Kính Ảo" button visible

- [ ] **Test**: Save try-on history on model selection

  - Step 1: Mock POST `/api/try-on-history`
  - Step 2: User selects model in modal
  - Step 3: Wait 3s (debounce)
  - Assert: POST request sent

- [ ] **Test**: Display try-on history in profile
  - Step 1: Mock GET `/api/try-on-history` returns 5 items
  - Step 2: Render profile page
  - Assert: 5 history items displayed

---

## End-to-End Tests

### E2E Test 1: Happy Path - Try Glasses

**File**: `frontend/e2e/virtual-try-on-happy-path.spec.ts` (Playwright)

**Steps**:

1. Navigate to product detail page với virtual try-on support
2. Click "🥽 Thử Kính Ảo" button
3. Grant webcam permission (mock với fake video stream)
4. Wait for facemesh model to load
5. Verify canvas displays video + 3D overlay
6. Click different model thumbnail
7. Verify model changes
8. Click "Chụp Ảnh" button
9. Verify screenshot preview appears
10. Click "Download" button
11. Verify file downloaded
12. Close modal

**Expected**: Complete flow works without errors

---

### E2E Test 2: Error Handling - Permission Denied

**File**: `frontend/e2e/virtual-try-on-permission-denied.spec.ts`

**Steps**:

1. Navigate to product page
2. Click "Thử Kính Ảo"
3. Deny webcam permission
4. Verify error message appears: "Vui lòng cho phép truy cập camera..."
5. Verify "Mở Cài Đặt" link displayed
6. Verify modal still closeable

**Expected**: Graceful error handling

---

### E2E Test 3: Filter Products by Virtual Try-On

**File**: `frontend/e2e/filter-virtual-tryon-products.spec.ts`

**Steps**:

1. Navigate to products list page
2. Check filter "Hỗ Trợ Thử Ảo"
3. Verify URL updates to `?hasVirtualTryOn=true`
4. Verify only products with "🥽 Thử Ảo" badge displayed
5. Uncheck filter
6. Verify all products shown again

**Expected**: Filter works correctly

---

## Test Data

### Test Fixtures

#### Fixture 1: Mock Face Landmarks

```typescript
// test/fixtures/face-landmarks.fixture.ts
export const mockFaceLandmarks = {
  scaledMesh: [
    // ... 486 landmarks
    [320, 240, 0], // index 168: midEye
    [280, 240, 0], // index 143: leftEye
    [320, 280, 0], // index 2: noseBottom
    [360, 240, 0], // index 372: rightEye
  ],
  keypoints: {
    midEye: [320, 240, 0],
    leftEye: [280, 240, 0],
    noseBottom: [320, 280, 0],
    rightEye: [360, 240, 0],
  },
};
```

#### Fixture 2: Mock Product với Virtual Try-On

```typescript
// test/fixtures/product-with-tryon.fixture.ts
export const mockProductWithTryOn: ProductWithTryOn = {
  id: "test-product-123",
  name: "Kính 3D - Test Glasses",
  priceInt: 50000,
  imageUrls: ["https://example.com/image.jpg"],
  hasVirtualTryOn: true,
  virtualTryOnConfig: {
    modelType: "gltf",
    modelPath: "https://minio.local/3d-models/test/scene.gltf",
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 0.01,
    upOffset: 10,
  },
};
```

#### Fixture 3: Mock Try-On History

```typescript
// test/fixtures/try-on-history.fixture.ts
export const mockTryOnHistory: TryOnHistoryItem[] = [
  {
    id: "history-1",
    productId: "product-1",
    triedAt: "2024-01-15T10:30:00Z",
    product: {
      id: "product-1",
      name: "Kính 3D - Aviator",
      imageUrls: ["https://example.com/aviator.jpg"],
    },
  },
  // ... more items
];
```

### Seed Data Requirements

**Database Seed for Testing**:

```typescript
// backend/test/seed-test-data.ts
export async function seedTestData(dataSource: DataSource) {
  // Create test user
  const user = await dataSource.getRepository(User).save({
    email: "test@example.com",
    password: "hashed_password",
  });

  // Create 7 products với virtual try-on (matching production seed)
  const products = await Promise.all([
    dataSource.getRepository(Product).save({
      name: "Kính 3D - Sport Glasses B307",
      hasVirtualTryOn: true,
      virtualTryOnConfig: {
        /* config */
      },
    }),
    // ... 6 more
  ]);

  return { user, products };
}
```

### Test Database Setup

**Use Docker for Test Database**:

```bash
# docker-compose.test.yml
version: '3.8'
services:
  test-postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
```

---

## Test Reporting & Coverage

### Coverage Commands

**Backend**:

```bash
# Run tests với coverage
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm run test:cov -- --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

**Frontend**:

```bash
# Unit tests với coverage
npm run test -- --coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Coverage Gaps & Rationale

**Expected Coverage Gaps**:

1. **Three.js Scene Rendering** (hard to test): ~50% coverage

   - Rationale: WebGL rendering requires browser environment, mock không realistic
   - Mitigation: Manual testing + visual regression tests

2. **TensorFlow.js Model Loading** (~60% coverage):

   - Rationale: Model binary hard to mock realistically
   - Mitigation: Integration tests với real model loading

3. **WebRTC getUserMedia** (~70% coverage):
   - Rationale: Browser API, mock limited
   - Mitigation: E2E tests với real webcam simulation

**Target Coverage by Module**:

- Business logic (services, utils): 95%+
- API clients: 90%+
- React hooks: 85%+
- UI components: 80%+
- Integration code (Three.js, TF.js): 60%+

### Coverage Reports Location

- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend/coverage/lcov-report/index.html`
- **CI/CD**: Upload to Codecov hoặc Coveralls

---

## Manual Testing

### UI/UX Testing Checklist

#### Desktop Testing

- [ ] **Chrome 120+ (Windows/Mac)**

  - Webcam permission flow smooth
  - Model renders correctly
  - FPS >= 24
  - Screenshot capture works
  - No console errors

- [ ] **Safari 17+ (macOS)**

  - Webcam works (HTTPS required)
  - WebGL rendering correct
  - Model positioning accurate
  - Performance acceptable

- [ ] **Firefox 120+**

  - All features work
  - Face detection accurate
  - No memory leaks

- [ ] **Edge 120+**
  - Similar to Chrome
  - No compatibility issues

#### Mobile Testing

- [ ] **iPhone Safari (iOS 16+)**

  - Webcam permission prompt clear
  - Camera flip button works
  - Touch gestures for model selection
  - Responsive layout
  - Performance: FPS >= 20

- [ ] **Android Chrome**
  - Same as iOS checks
  - Front/back camera switch
  - Landscape orientation support

#### Accessibility Testing

- [ ] **Keyboard Navigation**

  - Tab through all controls
  - ESC closes modal
  - Arrow keys select models
  - Enter confirms actions

- [ ] **Screen Reader (NVDA/JAWS)**

  - Buttons have clear labels
  - Loading states announced
  - Error messages read aloud
  - Current model announced

- [ ] **Color Contrast**

  - All text meets WCAG AA
  - Focus indicators visible
  - Error states clear

- [ ] **Motion Sensitivity**
  - Option to reduce motion (if animations added)
  - No flashing/strobing effects

### Browser/Device Compatibility Matrix

| Browser/Device | Version | Webcam | Face Detection | 3D Rendering | Screenshot | Status     |
| -------------- | ------- | ------ | -------------- | ------------ | ---------- | ---------- |
| Chrome Desktop | 120+    |        |                |              |            | Pass       |
| Safari Desktop | 17+     |        |                |              |            | 🔄 Testing |
| Firefox        | 120+    |        |                |              |            | 🔄 Testing |
| Edge           | 120+    |        |                |              |            | 🔄 Testing |
| iPhone Safari  | iOS 16+ |        |                |              |            | 🔄 Testing |
| Android Chrome | 120+    |        |                |              |            | 🔄 Testing |

### Smoke Tests After Deployment

**Production Smoke Test Checklist**:

1. [ ] Navigate to production site (HTTPS)
2. [ ] Open any product với virtual try-on
3. [ ] Click "Thử Kính Ảo"
4. [ ] Grant camera permission
5. [ ] Verify face detection works
6. [ ] Select 2-3 different models
7. [ ] Take screenshot
8. [ ] Download image
9. [ ] Check try-on history saved (if logged in)
10. [ ] Verify no console errors
11. [ ] Check Sentry for exceptions

**Performance Checks**:

- Lighthouse score > 80
- FaceMesh load < 3s
- Model load < 2s per model
- FPS >= 24 (desktop), >= 20 (mobile)

---

## Performance Testing

### Load Testing Scenarios

#### Scenario 1: Concurrent Users Loading Models

**Tool**: Apache JMeter hoặc k6

**Setup**:

- 100 concurrent users
- Each user loads 3 different models
- Duration: 5 minutes

**Metrics**:

- MinIO S3 response time < 200ms (P95)
- Backend API response < 100ms (P95)
- No 5xx errors
- Server CPU < 70%

**Script** (k6):

```javascript
import http from "k6/http";

export let options = {
  vus: 100,
  duration: "5m",
};

export default function () {
  const productIds = ["id1", "id2", "id3"];
  productIds.forEach((id) => {
    http.get(`https://api.example.com/products/${id}`);
  });
}
```

#### Scenario 2: Try-On History Write Load

**Setup**:

- 500 users saving try-on history
- 10 requests per user per minute
- Duration: 10 minutes

**Metrics**:

- Database write latency < 50ms (P95)
- No deadlocks
- Database CPU < 80%

### Stress Testing Approach

**Stress Test Goals**:

- Find breaking point (max concurrent users)
- Verify graceful degradation
- Check error handling under load

**Method**:

- Gradually increase load: 100 → 500 → 1000 → 2000 users
- Monitor: response times, error rates, resource usage
- Identify bottlenecks

### Performance Benchmarks

**Baseline Metrics** (should không degrade):
| Metric | Target | Method |
|--------|--------|--------|
| Facemesh Load Time | < 3s | Measure từ model request → first detection |
| GLTF Model Load | < 2s | Measure từ fetch → scene.add() |
| Face Detection FPS | >= 24 | Count detections per second |
| API Response Time | < 200ms | P95 latency từ monitoring |
| Page Load Time | < 2s | Lighthouse |

**Performance Degradation Alerts**:

- If FPS drops below 20 → show warning "Kết nối chậm, trải nghiệm có thể không mượt"
- If model load > 5s → retry with lower quality textures

---

## Bug Tracking

### Issue Tracking Process

**Bug Report Template**:

```markdown
**Title**: [Component] Brief description

**Severity**: Critical / High / Medium / Low

**Environment**:

- Browser: Chrome 120 / Safari 17 / etc.
- OS: Windows 11 / macOS 14 / iOS 17
- Device: Desktop / iPhone 14 / etc.

**Steps to Reproduce**:

1. Navigate to...
2. Click...
3. Observe...

**Expected Behavior**:
Model should render correctly on face

**Actual Behavior**:
Model appears offset by 10px to the right

**Screenshots/Videos**:
[Attach]

**Console Errors**:
```

[Error log here]

```

**Additional Context**:
Only happens on Safari, works on Chrome
```

### Bug Severity Levels

| Severity     | Definition                   | Example                                             | Response Time |
| ------------ | ---------------------------- | --------------------------------------------------- | ------------- |
| **Critical** | Feature completely broken    | Webcam không start, blocking all users              | < 4 hours     |
| **High**     | Major functionality impaired | Model không track face, affects UX significantly    | < 24 hours    |
| **Medium**   | Minor functionality issue    | Screenshot filename typo, annoying but not blocking | < 3 days      |
| **Low**      | Cosmetic issue               | Button padding off by 2px                           | Next sprint   |

### Regression Testing Strategy

**After Bug Fix**:

1. Write test case reproducing bug
2. Fix bug
3. Verify test passes
4. Add to regression suite
5. Run full regression suite before deploy

**Regression Suite**:

- All critical path E2E tests
- All integration tests
- Unit tests cho affected modules

**Frequency**:

- Before every release (mandatory)
- Nightly builds (optional)

---

## Test Execution Timeline

### Phase 1: Development (Days 1-10)

- [ ] Write unit tests alongside implementation
- [ ] Run tests locally before commit
- [ ] Aim for 80%+ coverage incrementally

### Phase 2: Integration Testing (Days 11-12)

- [ ] Write integration tests
- [ ] Test API endpoints với real database
- [ ] Test component interactions

### Phase 3: E2E Testing (Day 13)

- [ ] Write 2-3 critical E2E tests
- [ ] Run on staging environment
- [ ] Fix issues found

### Phase 4: Manual Testing (Day 14)

- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] UAT (User Acceptance Testing)

### Phase 5: Pre-Production (Day 15)

- [ ] Full regression suite
- [ ] Load testing
- [ ] Security testing
- [ ] Final smoke test on staging

---

**Next Steps**:

1. Use `/writing-test` command to generate unit tests cho từng module
2. Write integration tests sau khi implement API endpoints
3. Setup E2E test framework (Playwright)
4. Execute manual testing checklist
5. Track coverage and fix gaps
6. Document bugs và regressions

---

**Testing Complete Criteria**:

- 80%+ unit test coverage
- All integration tests passing
- 2+ E2E tests covering critical paths
- Manual testing completed on 3+ browsers
- No critical/high severity bugs open
- Performance benchmarks met
- Accessibility checks passed
