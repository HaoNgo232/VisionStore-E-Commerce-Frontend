---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [ ] **Milestone 1: Foundation Setup** (Week 1)
  - MediaPipe + Three.js integration working
  - Basic face detection on uploaded image
  - Load and display one 3D model

- [ ] **Milestone 2: Core Try-On Feature** (Week 2)
  - Glasses overlay aligned with face landmarks
  - Switch between multiple glasses models
  - Basic UI for upload, select, and preview

- [ ] **Milestone 3: Backend Integration** (Week 3)
  - API endpoints for glasses models
  - MinIO S3 integration for 3D files
  - Product-to-model linking in database

- [ ] **Milestone 4: Polish & Integration** (Week 4)
  - Download result image
  - Add to cart integration
  - Error handling and edge cases
  - UI/UX polish

- [ ] **Milestone 5: Testing & Deployment** (Week 5)
  - Unit tests (hooks, services, utils)
  - Integration tests (API, end-to-end flows)
  - Manual testing (various images, browsers)
  - Production deployment

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation Setup (Week 1)

#### Frontend Setup
- [ ] **Task 1.1:** Install dependencies
  - `@mediapipe/tasks-vision`
  - `three` + `@types/three`
  - `@react-three/fiber` (optional, if using React wrapper)
  
- [ ] **Task 1.2:** Create try-on page structure
  - Create `/app/(public)/try-on/page.tsx`
  - Create folder structure: `features/try-on/`
  - Setup types in `features/try-on/types/try-on.types.ts`

- [ ] **Task 1.3:** Implement MediaPipe face detection
  - Create `useFaceDetection.ts` hook
  - Load MediaPipe WASM model
  - Extract face landmarks from uploaded image
  - Handle errors (no face, multiple faces)

- [ ] **Task 1.4:** Test face detection with sample images
  - Upload image → Get landmarks
  - Visualize landmarks on canvas (debug mode)
  - Test edge cases (profile, poor lighting, etc.)

#### Three.js Setup
- [ ] **Task 1.5:** Setup Three.js scene
  - Create `useTryOnRenderer.ts` hook
  - Initialize WebGLRenderer, Scene, Camera
  - Test render with basic geometry (cube)

- [ ] **Task 1.6:** Load GLB model
  - Create `useGlassesLoader.ts` hook
  - Use GLTFLoader to load one sample GLB from `3dmodel/`
  - Display model in Three.js scene
  - Debug: Check model scale, rotation, position

### Phase 2: Core Try-On Feature (Week 2)

#### Glasses Overlay Logic
- [ ] **Task 2.1:** Calculate glasses position from face landmarks
  - Create `face-utils.ts` with functions:
    - `calculateGlassesPosition(landmarks)` → x, y, z
    - `calculateGlassesScale(landmarks)` → scale factor
    - `calculateGlassesRotation(landmarks)` → rotation angles
  - Unit tests for these calculations

- [ ] **Task 2.2:** Position 3D model on face
  - Apply calculated position/scale/rotation to 3D model
  - Test with different face sizes and angles
  - Fine-tune alignment (may need manual offsets)

- [ ] **Task 2.3:** Composite 3D render on 2D image
  - Create `canvas-utils.ts` with `compositeImageAndModel()`
  - Render Three.js scene to offscreen canvas
  - Overlay on original uploaded image
  - Display result in main canvas

#### UI Components
- [ ] **Task 2.4:** Build ImageUploader component
  - File input + drag-and-drop
  - Image preview
  - Validation (file type, size < 10MB)
  - Loading state during upload

- [ ] **Task 2.5:** Build GlassesPicker component
  - Grid layout of glasses thumbnails
  - Click to select
  - Show active selection
  - Load glasses list from API (mock data first)

- [ ] **Task 2.6:** Build TryOnCanvas component
  - Display composite result
  - Loading spinner during processing
  - Placeholder when no image uploaded

- [ ] **Task 2.7:** Build ResultActions component
  - Download button (canvas.toBlob → download)
  - Save button (optional, for share feature)
  - Add to Cart button (link to product)

- [ ] **Task 2.8:** Integrate components in try-on page
  - Layout: Upload → Pick → Preview → Actions
  - State management with `useTryOnState.ts`
  - Handle user flow (upload → detect → select → render)

### Phase 3: Backend Integration (Week 3)

#### Backend API Development
- [ ] **Task 3.1:** Create GlassesModel entity (Prisma/TypeORM)
  - Define schema in `prisma/schema.prisma` or entity file
  - Run migration to create table
  - Seed with 7 sample models from `3dmodel/`

- [ ] **Task 3.2:** Extend Product model
  - Add `glassesModelId` field (optional foreign key)
  - Add relation to GlassesModel
  - Run migration

- [ ] **Task 3.3:** Upload 3D models to MinIO S3
  - Script to upload all GLB files from `3dmodel/` to MinIO
  - Bucket: `glasses-models`
  - Update database records with S3 URLs

- [ ] **Task 3.4:** Implement API endpoint: List glasses models
  - `GET /api/glasses/models`
  - Return list of GlassesModel with thumbnails
  - Include product info if linked

- [ ] **Task 3.5:** Implement API endpoint: Download GLB model
  - `GET /api/glasses/models/:id/download`
  - Stream file from MinIO S3
  - Or return presigned URL for direct download
  - Set proper Content-Type headers

- [ ] **Task 3.6 (Optional):** Implement save try-on result
  - `POST /api/glasses/try-on/save`
  - Accept uploaded image + result image
  - Store in MinIO S3 with TTL (e.g., 7 days)
  - Save metadata in TryOnResult table
  - Return shareable URL

#### Frontend API Integration
- [ ] **Task 3.7:** Create glasses API service
  - `features/try-on/services/glasses.service.ts`
  - Methods: `listModels()`, `downloadModel(id)`
  - Type-safe with Zod schemas

- [ ] **Task 3.8:** Create React Query hooks
  - `useGlassesModels()` - Fetch list
  - `useGlassesModel(id)` - Fetch single model
  - Handle loading, error states

- [ ] **Task 3.9:** Integrate with GlassesPicker
  - Replace mock data with API call
  - Display real thumbnails from backend
  - Handle loading and error states

- [ ] **Task 3.10:** Load GLB from MinIO S3
  - Update `useGlassesLoader` to fetch from API endpoint
  - Cache loaded models to avoid re-download
  - Handle download errors gracefully

### Phase 4: Admin Features (Week 3-4)

#### Admin: Upload 3D Model for Product
- [ ] **Task 4.1:** Add GLB upload field in admin product form
  - File input for GLB file
  - Preview 3D model before save (optional)
  - Validation (file type = `.glb`, size < 50MB)

- [ ] **Task 4.2:** Backend: Handle GLB upload
  - `POST /api/admin/glasses/models`
  - Upload file to MinIO S3
  - Create GlassesModel record
  - Generate thumbnail (optional, can be manual)

- [ ] **Task 4.3:** Link GlassesModel to Product
  - Dropdown in product form to select existing model
  - Or upload new model during product creation
  - Update Product.glassesModelId

- [ ] **Task 4.4:** Admin: Manage glasses models
  - List all uploaded models
  - Edit metadata (name, description)
  - Delete model (soft delete, check if used by products)

### Phase 5: Polish & Edge Cases (Week 4)

#### Error Handling
- [ ] **Task 5.1:** Handle "no face detected"
  - Clear error message
  - Suggestions (use frontal face, good lighting)
  - Option to try another image

- [ ] **Task 5.2:** Handle "multiple faces detected"
  - Error message
  - Option to crop image to single face (future)

- [ ] **Task 5.3:** Handle "model load failed"
  - Retry mechanism
  - Fallback to default model or skip
  - Error notification

- [ ] **Task 5.4:** Handle "face too small/large"
  - Warning if face confidence is low
  - Suggest better quality image

#### UX Polish
- [ ] **Task 5.5:** Add loading states
  - Skeleton loaders for glasses picker
  - Spinner during face detection
  - Progress bar for model loading (if possible)

- [ ] **Task 5.6:** Add success feedback
  - Toast notification after download
  - Confirmation modal after add to cart
  - Visual feedback on hover/click

- [ ] **Task 5.7:** Responsive design
  - Mobile-friendly layout (if scope allows)
  - Touch-friendly buttons
  - Image zoom/pan controls (optional)

- [ ] **Task 5.8:** Performance optimization
  - Lazy load Three.js and MediaPipe (code splitting)
  - Compress uploaded images before processing
  - Use lower resolution for preview, full res for download

#### Cart Integration
- [ ] **Task 5.9:** Add "Add to Cart" button
  - Button appears after try-on complete
  - Click → Call `/api/cart/add` with productId
  - Show confirmation message
  - Link to cart page

- [ ] **Task 5.10:** Pre-fill cart with try-on context
  - Pass try-on result image to cart (optional)
  - Show "You tried this model" badge in cart

### Phase 6: Testing (Week 5)

#### Unit Tests
- [ ] **Task 6.1:** Test face detection utils
  - `face-utils.ts` functions
  - Mock landmarks input
  - Verify calculations

- [ ] **Task 6.2:** Test canvas utils
  - `canvas-utils.ts` functions
  - Mock canvas and image data
  - Verify compositing logic

- [ ] **Task 6.3:** Test API service
  - `glasses.service.ts`
  - Mock fetch responses
  - Test error handling

- [ ] **Task 6.4:** Test custom hooks
  - `useFaceDetection`, `useGlassesLoader`, etc.
  - Use React Testing Library
  - Mock external dependencies (MediaPipe, Three.js)

#### Integration Tests
- [ ] **Task 6.5:** Test try-on flow end-to-end
  - Upload image → Detect face → Select glasses → Render → Download
  - Use Playwright or Cypress
  - Mock backend API responses

- [ ] **Task 6.6:** Test API endpoints
  - `GET /api/glasses/models` returns data
  - `GET /api/glasses/models/:id/download` serves GLB
  - Error cases (404, 500)

- [ ] **Task 6.7:** Test admin upload flow
  - Upload GLB → Save to MinIO → Link to product
  - Verify database records

#### Manual Testing
- [ ] **Task 6.8:** Test with various images
  - Frontal faces, profiles, groups
  - Different lighting conditions
  - Different face sizes and angles
  - Edge cases (glasses, masks, beards)

- [ ] **Task 6.9:** Test with all 7 glasses models
  - Verify each model loads correctly
  - Check alignment and scale
  - Identify any problematic models

- [ ] **Task 6.10:** Browser compatibility
  - Chrome desktop (primary)
  - Firefox, Safari (nice to have)
  - Mobile browsers (future)

- [ ] **Task 6.11:** Performance testing
  - Measure load times (page, models, detection)
  - Test with slow network (throttling)
  - Check memory usage (no leaks)

### Phase 7: Deployment (Week 5)

- [ ] **Task 7.1:** Deploy backend changes
  - Run database migrations
  - Deploy API endpoints
  - Upload 3D models to production MinIO

- [ ] **Task 7.2:** Deploy frontend
  - Build Next.js app
  - Deploy to production
  - Verify all assets load (WASM, models)

- [ ] **Task 7.3:** Post-deployment testing
  - Smoke test on production
  - Verify API endpoints work
  - Test try-on flow end-to-end

- [ ] **Task 7.4:** Monitor and iterate
  - Setup error tracking (Sentry)
  - Monitor face detection success rate
  - Collect user feedback

## Dependencies
**What needs to happen in what order?**

### Critical Path:
1. MediaPipe face detection working (Task 1.3) → Blocks all rendering work
2. Three.js setup + GLB loading (Task 1.5, 1.6) → Blocks overlay logic
3. Glasses positioning calculations (Task 2.1, 2.2) → Blocks composite
4. Backend API + MinIO (Phase 3) → Blocks production deployment

### Parallelizable Work:
- UI components (Task 2.4-2.8) can be built with mock data while backend is in progress
- Admin features (Phase 4) can be done in parallel with frontend polish (Phase 5)
- Testing (Phase 6) can start early with unit tests, integration tests later

### External Dependencies:
- **Backend team:** API endpoints for glasses models, cart integration
- **Design team:** UI mockups for try-on page (if not self-designed)
- **3D artists:** If need more models or model adjustments
- **MinIO S3:** Must be set up and accessible

### Blockers:
- MediaPipe Face Landmarker accuracy → If too low, may need alternative solution
- GLB models quality → If models don't fit faces well, need adjustments
- Performance issues → If client-side processing too slow, may need server-side

## Timeline & Estimates
**When will things be done?**

### Effort Estimates (Story Points / Hours):

| Phase | Tasks | Estimated Effort | Target Completion |
|-------|-------|------------------|-------------------|
| Phase 1: Foundation | 6 tasks | 16-20 hours | End of Week 1 |
| Phase 2: Core Feature | 8 tasks | 24-32 hours | End of Week 2 |
| Phase 3: Backend Integration | 10 tasks | 20-24 hours | End of Week 3 |
| Phase 4: Admin Features | 4 tasks | 12-16 hours | Mid Week 4 |
| Phase 5: Polish & Edge Cases | 10 tasks | 16-20 hours | End of Week 4 |
| Phase 6: Testing | 11 tasks | 20-24 hours | End of Week 5 |
| Phase 7: Deployment | 4 tasks | 4-8 hours | End of Week 5 |
| **Total** | **53 tasks** | **112-144 hours** | **5 weeks** |

### Milestone Dates (Assuming Start: Week 1):
- **Week 1 (Nov 11-15):** Foundation complete
- **Week 2 (Nov 18-22):** Core try-on working (demo-able)
- **Week 3 (Nov 25-29):** Backend integrated, live data
- **Week 4 (Dec 2-6):** Polish complete, admin ready
- **Week 5 (Dec 9-13):** Testing complete, deployed to production

### Buffer:
- Add 20% buffer for unknowns: **~6 weeks total**
- High-risk areas: MediaPipe integration, Three.js rendering, alignment accuracy

## Risks & Mitigation
**What could go wrong?**

### Technical Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **MediaPipe accuracy too low** | Medium | High | Test early (Week 1), have fallback plan (server-side detection) |
| **Three.js performance issues** | Low | Medium | Optimize rendering, use lower poly models, test on target devices |
| **GLB models don't fit faces well** | Medium | Medium | Adjust models or add manual alignment controls |
| **Browser compatibility issues** | Low | Low | Focus on Chrome first, progressive enhancement for others |
| **File size too large (WASM, models)** | Medium | Medium | Lazy load, compress models, use CDN |

### Resource Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Backend API delays** | Medium | High | Frontend uses mock data first, parallel development |
| **3D model availability** | Low | Medium | Have 7 models already, can start with those |
| **Design mockups not ready** | Low | Low | Use reference UI from sample projects |

### Dependency Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **MinIO S3 not configured** | Low | High | Verify access early, have local file serving fallback |
| **Cart API not available** | Low | Medium | Build try-on feature first, integrate cart later |

## Resources Needed
**What do we need to succeed?**

### Team Members:
- **Frontend Developer (You):** Full-time, 5 weeks
- **Backend Developer:** Part-time, Week 3 (API endpoints)
- **QA Tester (Optional):** Week 5 (manual testing)

### Tools & Services:
- **MediaPipe Face Landmarker:** Free, open-source
- **Three.js:** Free, open-source
- **MinIO S3:** Already available
- **Chrome DevTools:** For debugging WebGL/Canvas

### Infrastructure:
- **Staging environment:** For testing before production
- **CDN (Optional):** For faster 3D model delivery
- **Error tracking:** Sentry or similar (for production monitoring)

### Documentation/Knowledge:
- MediaPipe Face Landmarker docs: https://developers.google.com/mediapipe/solutions/vision/face_landmarker
- Three.js docs: https://threejs.org/docs/
- GLTFLoader examples: https://threejs.org/examples/#webgl_loader_gltf
- Reference projects: `Virtual-Glasses-Try-on-main`, `basic-virtual-tryon-glasses-master`
