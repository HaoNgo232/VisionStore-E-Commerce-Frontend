---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
feature: virtual-glasses-try-on
---

# Project Planning & Task Breakdown - Virtual Glasses Try-On

## Milestones

- [ ] **Milestone 1**: Backend Foundation (Days 1-3)

  - Database schema + migrations
  - API endpoints
  - Seed data với 7 models

- [ ] **Milestone 2**: Frontend Core (Days 4-7)

  - Webcam + Facemesh integration
  - Three.js rendering setup
  - Basic try-on modal

- [ ] **Milestone 3**: Feature Complete (Days 8-10)

  - Model selection UI
  - Screenshot capture
  - Try-on history

- [ ] **Milestone 4**: Polish & Testing (Days 11-14)
  - Error handling
  - Performance optimization
  - Cross-browser testing
  - Documentation

## Task Breakdown

### Phase 1: Backend Foundation (Days 1-3, ~24h effort)

#### Task 1.1: Database Schema & Migration

**Priority**: CRITICAL | **Effort**: 3h | **Owner**: Backend

- [ ] Tạo migration file `add-virtual-try-on.sql`
- [ ] Add `hasVirtualTryOn`, `virtualTryOnConfig` columns to `products` table
- [ ] Create `try_on_history` table với relationships
- [ ] Add indexes cho performance
- [ ] Run migration trên local database
- [ ] Verify schema với `psql` hoặc TablePlus

**Acceptance Criteria**:

- Migration chạy thành công không lỗi
- Foreign keys đúng với `users` và `products`
- Indexes được tạo đúng

---

#### Task 1.2: Backend Entity & DTOs

**Priority**: CRITICAL | **Effort**: 2h | **Owner**: Backend

- [ ] Extend `Product` entity với new fields
- [ ] Create `TryOnHistory` entity với relations
- [ ] Create DTOs:
  - `VirtualTryOnConfigDto`
  - `CreateTryOnHistoryDto`
  - `TryOnHistoryResponseDto`
- [ ] Add Zod validation schemas (sync với frontend)

**Files to Create/Modify**:

- `backend/src/products/entities/product.entity.ts`
- `backend/src/try-on-history/entities/try-on-history.entity.ts`
- `backend/src/try-on-history/dto/*.dto.ts`

---

#### Task 1.3: MinIO Service Extension

**Priority**: HIGH | **Effort**: 2h | **Owner**: Backend

- [ ] Add method `uploadGLTFModel(file, productId)`
- [ ] Add method `getModelPresignedUrl(modelPath, expiry)`
- [ ] Configure CORS cho MinIO bucket `3d-models`
- [ ] Test upload/download GLTF file manually

**CORS Config**:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

---

#### Task 1.4: Products API Extension

**Priority**: HIGH | **Effort**: 3h | **Owner**: Backend

- [ ] Modify `GET /products/:id` để include `virtualTryOnConfig`
- [ ] Add query param `GET /products?hasVirtualTryOn=true`
- [ ] Update `ProductsService` với filter logic
- [ ] Transform `virtualTryOnConfig.modelPath` thành pre-signed URL
- [ ] Write unit tests cho filter logic

**Example Response**:

```typescript
{
  id: "clx123abc456def789ghi012", // CUID format
  name: "Kính 3D - Sport Glasses B307",
  hasVirtualTryOn: true,
  virtualTryOnConfig: {
    modelType: "gltf",
    modelPath: "https://minio:9000/3d-models/...", // Pre-signed URL
    position: { x: 0, y: 0.5, z: 0 },
    scale: 0.01,
    upOffset: 10
  }
}
```

---

#### Task 1.5: Try-On History API

**Priority**: MEDIUM | **Effort**: 4h | **Owner**: Backend

- [ ] Create `TryOnHistoryModule`, Controller, Service
- [ ] Implement `POST /try-on-history` với upsert logic:
  - Nếu user đã thử sản phẩm trong cùng ngày → increment `tryCount`
  - Nếu chưa → insert new record
- [ ] Implement `GET /try-on-history` với pagination
- [ ] Add auth guard (JWT required)
- [ ] Write unit tests cho service logic

**Upsert Logic**:

```typescript
async saveTryOn(userId: string, productId: string) {
  const today = startOfDay(new Date());
  const existing = await this.repo.findOne({
    where: { userId, productId, triedAt: MoreThanOrEqual(today) }
  });

  if (existing) {
    existing.tryCount++;
    return this.repo.save(existing);
  }

  return this.repo.save({ userId, productId, tryCount: 1 });
}
```

---

#### Task 1.6: Seed Data Script

**Priority**: CRITICAL | **Effort**: 6h | **Owner**: Backend

- [ ] Copy 7 folders từ `Virtual-Glasses-Try-on-main/3dmodel/` vào `backend/scripts/seed-data/3d-models/`
- [ ] Write script `upload-3d-models.ts`:
  - Upload GLTF + textures lên MinIO cho mỗi model
  - Store paths trong array
- [ ] Write script `glasses-products.seed.ts`:
  - Create 7 products với tên rõ ràng
  - Set `hasVirtualTryOn = true`
  - Populate `virtualTryOnConfig` từ HTML attributes (data-3d-x, data-3d-y, etc.)
- [ ] Add seed script vào `package.json` scripts
- [ ] Run seed: `npm run seed:glasses`
- [ ] Verify trong database + MinIO console

**Product Names**:

1. "Kính 3D - Sport Glasses B307" (glasses-01)
2. "Kính 3D - Glasses 07 Classic" (glasses-02)
3. "Kính 3D - Cartoon Glasses Fun" (glasses-03)
4. "Kính 3D - Plastic Sunglasses" (glasses-04)
5. "Kính 3D - Aviator Sunglasses" (glasses-05)
6. "Kính 3D - EyeGlasses Modern" (glasses-06)
7. "Kính 3D - 3D Frames Quick" (glasses-07)

**Config Mapping** (from HTML data attributes):

```typescript
const glassesConfigs = [
  {
    folder: "glasses-01",
    position: { x: 0, y: 0.5, z: 0 },
    scale: 0.01,
    upOffset: 10,
  },
  {
    folder: "glasses-02",
    position: { x: 0, y: 0.3, z: 0 },
    scale: 0.4,
    upOffset: 0,
  },
  // ... map all 7
];
```

---

#### Task 1.7: Backend Testing

**Priority**: HIGH | **Effort**: 4h | **Owner**: Backend

- [ ] Unit tests cho `TryOnHistoryService`
- [ ] Integration tests cho API endpoints
- [ ] Test filter `?hasVirtualTryOn=true`
- [ ] Test pre-signed URL generation
- [ ] Aim for 80%+ coverage

---

### Phase 2: Frontend Core (Days 4-7, ~32h effort)

#### Task 2.1: Project Setup & Dependencies

**Priority**: CRITICAL | **Effort**: 2h | **Owner**: Frontend

- [ ] Install dependencies:
  ```bash
  npm install three @types/three
  npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl
  npm install @tensorflow-models/face-landmarks-detection
  ```
- [ ] Add TypeScript types cho Three.js modules
- [ ] Setup ESLint rules để allow dynamic imports (for Three.js)
- [ ] Create feature folder structure (đã design ở trên)

---

#### Task 2.2: Type Definitions & Zod Schemas

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [ ] Create `virtual-try-on.types.ts` với Zod schemas:
  - `VirtualTryOnConfigSchema`
  - `ProductWithTryOnSchema`
  - `TryOnHistoryItemSchema`
- [ ] Export inferred types
- [ ] Sync với backend DTOs (compare schemas)

---

#### Task 2.3: API Service Layer

**Priority**: HIGH | **Effort**: 2h | **Owner**: Frontend

- [ ] Create `virtual-try-on.service.ts` extends `BaseApiService`
- [ ] Implement methods:
  - `getProductForTryOn(id)`
  - `saveTryOnHistory(productId)`
  - `getTryOnHistory()`
- [ ] Add Zod validation cho responses
- [ ] Error handling với `ApiError`

---

#### Task 2.4: Webcam Management Hook

**Priority**: CRITICAL | **Effort**: 4h | **Owner**: Frontend

- [ ] Create `lib/webcam-manager.ts` class:
  - `start()` - Request webcam access
  - `stop()` - Release webcam
  - `flip()` - Switch front/back camera (mobile)
  - Error handling cho permission denied
- [ ] Create `hooks/useWebcam.ts`:
  - Manage videoRef
  - Lifecycle (cleanup on unmount)
  - State: `isReady`, `isLoading`, `error`
- [ ] Test trên Chrome, Safari, Firefox

**API Usage**:

```typescript
const { videoRef, isReady, error, start, stop } = useWebcam();

useEffect(() => {
  start();
  return () => stop();
}, []);
```

---

#### Task 2.5: Facemesh Detection Hook

**Priority**: CRITICAL | **Effort**: 6h | **Owner**: Frontend

- [ ] Create `lib/facemesh-detector.ts`:
  - Load TensorFlow.js + Facemesh model
  - `detectFaces(videoElement)` → returns landmarks
  - Extract keypoints: `midEye: 168, leftEye: 143, noseBottom: 2, rightEye: 372`
- [ ] Create `hooks/useFacemesh.ts`:
  - Load model on mount (with loading state)
  - Start detection loop khi video ready
  - Return landmarks array
  - Cleanup on unmount
- [ ] Optimize: throttle detection to 24 FPS
- [ ] Error handling: model load fail

**Keypoints Reference** (from README):

```typescript
const FACE_KEYPOINTS = {
  midEye: 168,
  leftEye: 143,
  noseBottom: 2,
  rightEye: 372,
};
```

---

#### Task 2.6: Three.js Scene Setup Hook

**Priority**: CRITICAL | **Effort**: 5h | **Owner**: Frontend

- [ ] Create `lib/three-scene-manager.ts`:
  - Setup scene, camera, renderer
  - Add lights (front + back SpotLight)
  - Setup camera for video overlay (match video dimensions)
- [ ] Create `hooks/useThreeScene.ts`:
  - Initialize scene on mount
  - Return `{ scene, camera, renderer, canvasRef }`
  - Cleanup: dispose geometries, materials, renderer
- [ ] Test rendering với dummy cube

**Camera Setup** (match video dimensions):

```typescript
camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
camera.position.x = videoWidth / 2;
camera.position.y = -videoHeight / 2;
camera.position.z = -(videoHeight / 2) / Math.tan(45 / 2);
camera.lookAt(videoWidth / 2, -videoHeight / 2, 0);
```

---

#### Task 2.7: GLTF Model Loader

**Priority**: HIGH | **Effort**: 4h | **Owner**: Frontend

- [ ] Create `lib/gltf-loader.ts`:
  - Use `GLTFLoader` from Three.js
  - Load model from URL
  - Return loaded scene object
  - Cache loaded models (Map<url, scene>)
- [ ] Handle loading states
- [ ] Error handling: retry logic (3 attempts)
- [ ] Progress tracking (optional)

---

#### Task 2.8: Glasses Renderer Hook

**Priority**: CRITICAL | **Effort**: 6h | **Owner**: Frontend

- [ ] Create `hooks/useGlassesRenderer.ts`:
  - Load GLTF model dựa vào config
  - Add model vào scene
  - Render loop với `requestAnimationFrame`
  - Update position/rotation based on face landmarks
  - Calculate scale based on eye distance
- [ ] Implement tracking logic:
  - Position: `midEye` landmark
  - Rotation: vector từ `midEye` → `noseBottom`
  - Scale: distance giữa `leftEye` và `rightEye`
- [ ] Optimize: only render when landmarks change

**Tracking Algorithm** (from reference code):

```typescript
// Position
glasses.position.x = midEye[0];
glasses.position.y = -midEye[1] + upOffset;
glasses.position.z = -camera.position.z + midEye[2];

// Up vector (rotation)
glasses.up.x = midEye[0] - noseBottom[0];
glasses.up.y = -(midEye[1] - noseBottom[1]);
glasses.up.z = midEye[2] - noseBottom[2];
// Normalize up vector

// Scale based on eye distance
const eyeDist = Math.sqrt(
  (leftEye[0] - rightEye[0]) ** 2 +
    (leftEye[1] - rightEye[1]) ** 2 +
    (leftEye[2] - rightEye[2]) ** 2,
);
glasses.scale.set(eyeDist * scale, eyeDist * scale, eyeDist * scale);

// Final rotation adjustments
glasses.rotation.y = Math.PI;
glasses.rotation.z = Math.PI / 2 - Math.acos(glasses.up.x);
```

---

#### Task 2.9: Virtual Try-On Modal Component

**Priority**: HIGH | **Effort**: 5h | **Owner**: Frontend

- [ ] Create `VirtualTryOnModal.tsx`:
  - Modal overlay (full screen hoặc dialog)
  - Video element + Canvas overlay
  - Loading state: "Loading Model..."
  - Error state: permission denied, model load fail
  - Close button
- [ ] Integrate hooks: `useWebcam`, `useFacemesh`, `useThreeScene`, `useGlassesRenderer`
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility: ESC key to close, focus trap

**Component Structure**:

```tsx
<Modal open={isOpen} onClose={onClose}>
  <ModalOverlay>
    <VideoContainer>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage />}
    </VideoContainer>
    <GlassesSelector models={models} onSelect={onSelectModel} />
    <TryOnControls onCapture={onCapture} onClose={onClose} />
  </ModalOverlay>
</Modal>
```

---

### Phase 3: Feature Complete (Days 8-10, ~24h effort)

#### Task 3.1: Glasses Selector UI

**Priority**: HIGH | **Effort**: 4h | **Owner**: Frontend

- [ ] Create `GlassesSelector.tsx`:
  - Horizontal scrollable list (carousel)
  - Thumbnail images cho mỗi model
  - Highlight selected model
  - Arrow buttons (left/right)
  - Swipe gesture support (mobile)
- [ ] Integrate với API: fetch products có `hasVirtualTryOn=true`
- [ ] On select: call `onSelectModel(productId)`
- [ ] Show product name + price dưới thumbnail

**Design Reference**: Reference code có `#glasses-slider` với arrows

---

#### Task 3.2: Screenshot Capture Feature

**Priority**: MEDIUM | **Effort**: 4h | **Owner**: Frontend

- [ ] Create `lib/screenshot-capture.ts`:
  - Capture canvas + video element thành image
  - Merge video frame + 3D overlay
  - Return Blob (PNG format)
- [ ] Add "Chụp Ảnh" button trong `TryOnControls`
- [ ] On capture:
  - Freeze frame (pause detection)
  - Show preview modal
  - Options: Download, Retake, Continue
- [ ] Download logic: trigger browser download với filename `tryon-{timestamp}.png`

**Implementation**:

```typescript
function captureScreenshot(videoEl, canvasEl) {
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");

  // Draw video frame
  ctx.drawImage(videoEl, 0, 0);

  // Draw 3D overlay
  ctx.drawImage(canvasEl, 0, 0);

  return tempCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tryon-${Date.now()}.png`;
    a.click();
  }, "image/png");
}
```

---

#### Task 3.3: Try-On History Integration

**Priority**: MEDIUM | **Effort**: 4h | **Owner**: Frontend

- [ ] Create `hooks/useTryOnHistory.ts` (React Query wrapper):
  - `useSaveTryOnHistory` mutation
  - `useGetTryOnHistory` query
- [ ] Auto-save history khi user thử model (debounced, 3s delay)
- [ ] Create `TryOnHistory.tsx` component:
  - List recent tried models
  - Thumbnail + product name
  - Click to navigate to product page
  - Show in user profile page hoặc modal sidebar
- [ ] Handle auth: nếu chưa login, skip save (optional: toast "Đăng nhập để lưu lịch sử")

---

#### Task 3.4: Product Page Integration

**Priority**: HIGH | **Effort**: 3h | **Owner**: Frontend

- [ ] Modify `app/products/[id]/page.tsx`:
  - Check if `product.hasVirtualTryOn === true`
  - Show "🥽 Thử Kính Ảo" button (prominent position)
  - On click: open `VirtualTryOnModal`
- [ ] Pass `product.virtualTryOnConfig` to modal
- [ ] State management: modal open/close

---

#### Task 3.5: Product List Badge & Filter

**Priority**: MEDIUM | **Effort**: 3h | **Owner**: Frontend

- [ ] Add badge "🥽 Thử Ảo" trên `ProductCard` nếu `hasVirtualTryOn`
- [ ] Add filter checkbox "Hỗ Trợ Thử Ảo" trong product list page
- [ ] Update API call: append `?hasVirtualTryOn=true` khi filter active
- [ ] Update URL query params for deep linking

---

#### Task 3.6: Loading States & Error Handling

**Priority**: HIGH | **Effort**: 4h | **Owner**: Frontend

- [ ] Loading states:
  - Webcam initializing
  - Facemesh model loading (progress %)
  - GLTF model loading
- [ ] Error states:
  - Webcam permission denied → show instruction + browser settings link
  - Face not detected → hint "Hãy nhìn thẳng vào camera"
  - Model load failed → retry button
  - Network error → retry/offline message
- [ ] Toast notifications cho success actions
- [ ] React Error Boundary wrap modal

---

### Phase 4: Polish & Testing (Days 11-14, ~32h effort)

#### Task 4.1: Performance Optimization

**Priority**: HIGH | **Effort**: 6h | **Owner**: Frontend

- [ ] Optimize render loop:
  - Only render when landmarks change (compare previous frame)
  - Throttle detection to 24 FPS (không cần 60 FPS)
- [ ] Lazy load Three.js và TF.js (dynamic imports)
- [ ] Code splitting: `VirtualTryOnModal` trong separate chunk
- [ ] Optimize GLTF models:
  - Check file sizes (should be < 2MB each)
  - Compress textures nếu cần (use tinypng.com)
- [ ] Measure với Lighthouse: Performance score > 80

---

#### Task 4.2: Mobile Responsive Design

**Priority**: HIGH | **Effort**: 4h | **Owner**: Frontend

- [ ] Test trên iPhone Safari, Android Chrome
- [ ] Adjust canvas size cho mobile screens
- [ ] Touch gestures: swipe to change models
- [ ] Camera flip button (front/back) cho mobile
- [ ] Handle orientation change (portrait/landscape)

---

#### Task 4.3: Cross-Browser Testing

**Priority**: HIGH | **Effort**: 4h | **Owner**: QA

- [ ] Test trên:
  - Chrome 120+ (desktop + mobile)
  - Safari 17+ (macOS + iOS)
  - Firefox 120+
  - Edge 120+
- [ ] Document known issues (e.g., Safari iOS permissions)
- [ ] Create compatibility matrix

---

#### Task 4.4: Accessibility (A11y)

**Priority**: MEDIUM | **Effort**: 3h | **Owner**: Frontend

- [ ] Keyboard navigation:
  - ESC to close modal
  - Tab through controls
  - Arrow keys to select models
- [ ] Screen reader support:
  - ARIA labels cho buttons
  - Announce loading states
  - Describe current selected model
- [ ] Focus management: trap focus trong modal
- [ ] Color contrast check (WCAG AA)

---

#### Task 4.5: Unit & Integration Tests

**Priority**: HIGH | **Effort**: 8h | **Owner**: Frontend

- [ ] Unit tests:
  - `webcam-manager.ts` - mock getUserMedia
  - `facemesh-detector.ts` - mock TF.js
  - `gltf-loader.ts` - mock fetch
  - API service methods
- [ ] Integration tests:
  - Full try-on flow (with MSW mocks)
  - Model selection + rendering
  - Screenshot capture
- [ ] Use `/writing-test` command để generate tests
- [ ] Aim for 80%+ coverage

---

#### Task 4.6: E2E Tests (Optional)

**Priority**: LOW | **Effort**: 4h | **Owner**: QA

- [ ] Playwright tests:
  - Open product page → click "Thử Ảo" → grant webcam → model loads
  - Select different models
  - Capture screenshot
  - Close modal
- [ ] Mock webcam stream với fake video file

---

#### Task 4.7: Documentation

**Priority**: MEDIUM | **Effort**: 3h | **Owner**: All

- [ ] Update `README.md` với feature description
- [ ] Add screenshots/GIFs của feature
- [ ] Developer guide:
  - How to add new models
  - How to configure position/scale
  - Troubleshooting common issues
- [ ] User guide (optional):
  - How to use virtual try-on
  - Browser requirements
  - FAQ

---

## Dependencies

### Critical Path

```
Task 1.1 → Task 1.2 → Task 1.4, 1.5, 1.6
                   ↓
Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4 → Task 2.5 → Task 2.6 → Task 2.8 → Task 2.9
                                                                              ↓
                                                                         Task 3.4
```

### External Dependencies

- MinIO S3 already setup in Docker
- PostgreSQL database available
- User authentication already implemented
- Product entity exists? (verify schema)
- Frontend has auth context + API client

### Team Dependencies

- Backend dev: Tasks 1.x
- Frontend dev: Tasks 2.x, 3.x
- QA: Task 4.3, 4.6
- Overlap: Task 1.7, 4.5 (tests)

---

## Timeline & Estimates

### Sprint 1 (Week 1)

- **Days 1-3**: Backend Foundation (Milestone 1)
- **Days 4-5**: Frontend Core Start (partial Milestone 2)

### Sprint 2 (Week 2)

- **Days 6-7**: Frontend Core Complete (Milestone 2)
- **Days 8-10**: Feature Complete (Milestone 3)

### Sprint 3 (Week 3)

- **Days 11-14**: Polish & Testing (Milestone 4)

### Total Estimate

- **Effort**: ~112 hours (14 days @ 8h/day)
- **Timeline**: 2-3 tuần (với buffer)
- **Resources**: 1 full-stack dev (hoặc 1 BE + 1 FE parallel)

### Buffer for Unknowns

- +20% buffer cho:
  - Three.js integration issues
  - Browser compatibility bugs
  - Model positioning tweaks
  - Performance optimization iterations

---

## Risks & Mitigation

### Risk 1: Three.js + Next.js SSR Conflicts

**Probability**: MEDIUM | **Impact**: HIGH

**Mitigation**:

- Use dynamic imports: `const THREE = await import('three')`
- Wrap component with `'use client'` directive
- Test SSR build early (Day 5)

---

### Risk 2: Safari iOS Webcam Permissions

**Probability**: HIGH | **Impact**: MEDIUM

**Mitigation**:

- Clear documentation + user instructions
- Test on real iOS device early (Day 7)
- Provide fallback: "Mở trong Safari nếu dùng in-app browser"

---

### Risk 3: Model Positioning Inaccuracy

**Probability**: MEDIUM | **Impact**: MEDIUM

**Mitigation**:

- Reference code đã proven, copy algorithm chính xác
- Allow fine-tuning config per model
- Manual testing với nhiều khuôn mặt khác nhau

---

### Risk 4: Performance on Low-End Devices

**Probability**: MEDIUM | **Impact**: MEDIUM

**Mitigation**:

- Test trên mid-range Android device (Day 12)
- Reduce FPS to 20 nếu cần
- Simplify models: lower poly count

---

### Risk 5: Backend Product Schema Not Extensible

**Probability**: LOW | **Impact**: HIGH

**Mitigation**:

- Verify schema ngay Day 1
- Use JSONB field flexible, không cần nhiều columns
- Worst case: create separate table `product_3d_models`

---

## Resources Needed

### Team Members

- **Backend Developer**: 40h (Tasks 1.x)
- **Frontend Developer**: 60h (Tasks 2.x, 3.x, 4.x)
- **QA Engineer**: 12h (Tasks 4.3, 4.6)

### Tools & Services

- Already available:
- Docker + MinIO S3
- PostgreSQL
- Next.js + NestJS
- 🆕 New dependencies:
  - Three.js (~600KB)
  - TensorFlow.js (~2MB)
  - @tensorflow-models/face-landmarks-detection (~500KB)

### Infrastructure

- Local development: localhost HTTPS (for webcam)
- Use `mkcert` to generate local SSL cert
- Staging: HTTPS required (Let's Encrypt)
- Production: HTTPS (already setup)

### Documentation/Knowledge

- Reference project: Virtual-Glasses-Try-on-main
- Three.js docs: https://threejs.org/docs
- TensorFlow.js Facemesh: https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection
- 📚 Need to learn:
  - GLTF format structure
  - WebGL optimization techniques

---

**Next Steps**:

1. Review plan với team
2. Assign tasks to team members
3. Setup project board (Jira/Trello)
4. Kickoff meeting
5. Start Phase 1: Backend Foundation
6. Proceed to Implementation phase → use `/execute-plan` command
