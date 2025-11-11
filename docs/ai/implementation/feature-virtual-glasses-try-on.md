---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

### Prerequisites:
- Node.js 18+ (Next.js 14 requirement)
- npm or yarn
- Chrome browser (for testing)
- Backend API running locally (for integration testing)
- MinIO S3 access configured

### Install Dependencies:
```bash
cd frontend-luan-van

# Install MediaPipe
npm install @mediapipe/tasks-vision

# Install Three.js
npm install three @types/three

# Optional: React Three Fiber (if using)
npm install @react-three/fiber @react-three/drei
```

### Environment Setup:
Add to `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
NEXT_PUBLIC_GLASSES_BUCKET=glasses-models
```

### MediaPipe Model Files:
MediaPipe Face Landmarker requires WASM files. Two options:

**Option 1: CDN (Recommended for dev):**
```typescript
const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
```

**Option 2: Local (For production):**
- Download WASM files to `public/wasm/mediapipe/`
- Load from local path

## Code Structure
**How is the code organized?**

```
frontend-luan-van/
├── app/
│   └── (public)/
│       └── try-on/
│           ├── page.tsx                    # Main page
│           └── components/
│               ├── ImageUploader.tsx
│               ├── FaceDetector.tsx
│               ├── GlassesPicker.tsx
│               ├── TryOnCanvas.tsx
│               ├── ResultActions.tsx
│               └── ErrorDisplay.tsx
│
├── features/
│   └── try-on/
│       ├── hooks/
│       │   ├── useFaceDetection.ts         # MediaPipe logic
│       │   ├── useGlassesLoader.ts         # Load GLB models
│       │   ├── useTryOnRenderer.ts         # Three.js rendering
│       │   └── useTryOnState.ts            # State management
│       │
│       ├── services/
│       │   ├── glasses.service.ts          # API client
│       │   └── image.service.ts            # Image processing
│       │
│       ├── types/
│       │   └── try-on.types.ts             # TypeScript types
│       │
│       └── utils/
│           ├── face-utils.ts               # Landmark calculations
│           └── canvas-utils.ts             # Canvas helpers
│
├── public/
│   └── wasm/
│       └── mediapipe/                      # Optional: local WASM files
│
└── types/
    └── glasses.types.ts                    # Shared types
```

### Naming Conventions:
- **Components:** PascalCase (`ImageUploader.tsx`)
- **Hooks:** camelCase with `use` prefix (`useFaceDetection.ts`)
- **Services:** camelCase with `.service.ts` suffix
- **Utils:** camelCase with descriptive names (`face-utils.ts`)
- **Types:** PascalCase interfaces (`FaceLandmarks`, `TryOnState`)

## Implementation Notes
**Key technical details to remember:**

### Core Feature 1: Face Detection with MediaPipe

**File:** `features/try-on/hooks/useFaceDetection.ts`

```typescript
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useFaceDetection() {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize MediaPipe
  useEffect(() => {
    async function loadMediaPipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        numFaces: 1, // Only detect 1 face
        runningMode: "IMAGE"
      });
      
      setFaceLandmarker(landmarker);
      setIsLoading(false);
    }
    
    loadMediaPipe();
  }, []);

  // Detect face in image
  const detectFace = useCallback(async (image: HTMLImageElement) => {
    if (!faceLandmarker) throw new Error("Face detector not initialized");
    
    const result = faceLandmarker.detect(image);
    
    if (result.faceLandmarks.length === 0) {
      throw new Error("No face detected");
    }
    
    if (result.faceLandmarks.length > 1) {
      throw new Error("Multiple faces detected. Please use a photo with one face.");
    }
    
    // Extract key landmarks
    const landmarks = result.faceLandmarks[0];
    return extractKeyLandmarks(landmarks);
  }, [faceLandmarker]);

  return { detectFace, isLoading };
}
```

**Key Points:**
- Initialize once, reuse for multiple detections
- Use GPU delegate for better performance
- Handle edge cases (no face, multiple faces)
- Extract only needed landmarks (nose bridge, eyes, ears)

### Core Feature 2: Three.js Glasses Rendering

**File:** `features/try-on/hooks/useTryOnRenderer.ts`

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function useTryOnRenderer(canvasRef: RefObject<HTMLCanvasElement>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const glassesRef = useRef<THREE.Object3D | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -1, 1, 1, -1, 0.1, 1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true, // Transparent background
      antialias: true
    });
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    return () => {
      renderer.dispose();
    };
  }, [canvasRef]);

  // Load GLB model
  const loadGlasses = useCallback(async (modelUrl: string) => {
    if (!sceneRef.current) return;

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelUrl);
    
    // Remove previous glasses
    if (glassesRef.current) {
      sceneRef.current.remove(glassesRef.current);
    }
    
    glassesRef.current = gltf.scene;
    sceneRef.current.add(gltf.scene);
    
    return gltf.scene;
  }, []);

  // Position glasses based on face landmarks
  const positionGlasses = useCallback((landmarks: FaceLandmarks) => {
    if (!glassesRef.current) return;

    const { position, scale, rotation } = calculateGlassesTransform(landmarks);
    
    glassesRef.current.position.set(position.x, position.y, position.z);
    glassesRef.current.scale.set(scale, scale, scale);
    glassesRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
  }, []);

  // Render scene
  const render = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  return { loadGlasses, positionGlasses, render };
}
```

**Key Points:**
- Use OrthographicCamera for 2D overlay (no perspective distortion)
- Transparent background (`alpha: true`) for compositing
- Proper lighting for realistic appearance
- Dispose resources on unmount (prevent memory leaks)

### Core Feature 3: Face Landmark Calculations

**File:** `features/try-on/utils/face-utils.ts`

```typescript
export interface FaceLandmarks {
  noseBridge: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  leftEar: { x: number; y: number };
  rightEar: { x: number; y: number };
  faceWidth: number;
  faceAngle: number;
}

export function extractKeyLandmarks(rawLandmarks: any[]): FaceLandmarks {
  // MediaPipe Face Landmarker returns 478 landmarks
  // Key indices: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
  
  const noseBridge = rawLandmarks[6]; // Top of nose
  const leftEye = rawLandmarks[33]; // Left eye center
  const rightEye = rawLandmarks[263]; // Right eye center
  const leftEar = rawLandmarks[234]; // Left ear
  const rightEar = rawLandmarks[454]; // Right ear
  
  const faceWidth = Math.abs(leftEar.x - rightEar.x);
  const faceAngle = calculateFaceAngle(leftEye, rightEye);
  
  return {
    noseBridge: { x: noseBridge.x, y: noseBridge.y },
    leftEye: { x: leftEye.x, y: leftEye.y },
    rightEye: { x: rightEye.x, y: rightEye.y },
    leftEar: { x: leftEar.x, y: leftEar.y },
    rightEar: { x: rightEar.x, y: rightEar.y },
    faceWidth,
    faceAngle
  };
}

export function calculateGlassesTransform(landmarks: FaceLandmarks) {
  // Calculate center point (between eyes)
  const centerX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
  const centerY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;
  
  // Scale based on face width (empirical formula)
  const scale = landmarks.faceWidth * 2.5; // Adjust multiplier as needed
  
  // Position slightly above center (on nose bridge)
  const positionX = centerX;
  const positionY = centerY - 0.02; // Offset up slightly
  
  // Rotation based on face angle
  const rotationZ = landmarks.faceAngle;
  
  return {
    position: { x: positionX, y: positionY, z: 0 },
    scale,
    rotation: { x: 0, y: 0, z: rotationZ }
  };
}

function calculateFaceAngle(leftEye: Point, rightEye: Point): number {
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  return Math.atan2(dy, dx);
}
```

**Key Points:**
- Use specific landmark indices from MediaPipe docs
- Calculate scale based on face width (relative sizing)
- Position glasses on nose bridge, not eye level
- Account for head tilt (rotation)
- Fine-tune offsets empirically with test images

### Core Feature 4: Canvas Compositing

**File:** `features/try-on/utils/canvas-utils.ts`

```typescript
export async function compositeImageAndGlasses(
  originalImage: HTMLImageElement,
  glassesCanvas: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  // Create output canvas with same size as original image
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = originalImage.width;
  outputCanvas.height = originalImage.height;
  
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error("Cannot get canvas context");
  
  // Draw original image
  ctx.drawImage(originalImage, 0, 0);
  
  // Draw glasses overlay (Three.js render)
  ctx.drawImage(glassesCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
  
  return outputCanvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }, 'image/png');
}
```

### Patterns & Best Practices

#### Pattern 1: Separate Business Logic from UI
- Hooks contain logic (detection, rendering, state)
- Components only handle UI and user interaction
- Services handle API calls

#### Pattern 2: Error Boundaries
```typescript
// Wrap try-on page in error boundary
<ErrorBoundary fallback={<TryOnErrorFallback />}>
  <TryOnPage />
</ErrorBoundary>
```

#### Pattern 3: Loading States
- Show skeleton while loading glasses models
- Show spinner during face detection
- Disable buttons during processing

#### Pattern 4: Memoization
```typescript
// Memoize expensive calculations
const glassesTransform = useMemo(
  () => calculateGlassesTransform(landmarks),
  [landmarks]
);

// Memoize callbacks
const handleSelectGlasses = useCallback((id: string) => {
  loadGlasses(id);
}, [loadGlasses]);
```

## Integration Points
**How do pieces connect?**

### API Integration:

**File:** `features/try-on/services/glasses.service.ts`

```typescript
import { z } from 'zod';

const GlassesModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  modelUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  fileSize: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type GlassesModel = z.infer<typeof GlassesModelSchema>;

class GlassesApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  async listModels(): Promise<GlassesModel[]> {
    const response = await fetch(`${this.baseUrl}/glasses/models`);
    if (!response.ok) throw new Error('Failed to fetch glasses models');
    
    const data = await response.json();
    return z.array(GlassesModelSchema).parse(data.data);
  }

  async getModelDownloadUrl(id: string): Promise<string> {
    return `${this.baseUrl}/glasses/models/${id}/download`;
  }
}

export const glassesApi = new GlassesApiService();
```

### React Query Integration:

```typescript
export function useGlassesModels() {
  return useQuery({
    queryKey: ['glasses', 'models'],
    queryFn: () => glassesApi.listModels(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Cart Integration:

```typescript
export async function addToCart(productId: string, quantity: number = 1) {
  const response = await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
}
```

## Error Handling
**How do we handle failures?**

### Strategy:
- **User-facing errors:** Display clear messages with suggested actions
- **Technical errors:** Log to console + error tracking service (Sentry)
- **Retry logic:** Auto-retry failed 3D model downloads (3x)

### Error Types:

```typescript
export class TryOnError extends Error {
  constructor(
    message: string,
    public code: TryOnErrorCode,
    public userMessage: string
  ) {
    super(message);
    this.name = 'TryOnError';
  }
}

export enum TryOnErrorCode {
  NO_FACE_DETECTED = 'NO_FACE_DETECTED',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  RENDERING_FAILED = 'RENDERING_FAILED',
  INVALID_IMAGE = 'INVALID_IMAGE'
}

// Usage
if (result.faceLandmarks.length === 0) {
  throw new TryOnError(
    "Face detection returned 0 faces",
    TryOnErrorCode.NO_FACE_DETECTED,
    "Không tìm thấy khuôn mặt trong ảnh. Vui lòng sử dụng ảnh selfie rõ mặt."
  );
}
```

### Logging:
```typescript
// Wrap critical operations
try {
  const landmarks = await detectFace(image);
} catch (error) {
  console.error('[TryOn] Face detection failed:', error);
  
  // Send to error tracking
  Sentry.captureException(error, {
    tags: { feature: 'try-on', step: 'face-detection' }
  });
  
  // Show user-friendly error
  throw new TryOnError(...);
}
```

## Performance Considerations
**How do we keep it fast?**

### Optimization 1: Lazy Load Heavy Libraries
```typescript
// Dynamic import for Three.js
const loadThreeJS = () => import('three');

// Load only when needed
const { loadGlasses } = await loadThreeJS();
```

### Optimization 2: Image Compression
```typescript
// Compress uploaded image before processing
async function compressImage(file: File): Promise<File> {
  if (file.size < 2 * 1024 * 1024) return file; // < 2MB, skip
  
  // Use canvas to resize
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const MAX_WIDTH = 1920;
  const scale = Math.min(1, MAX_WIDTH / img.width);
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvasToFile(canvas, 'compressed.jpg');
}
```

### Optimization 3: Model Caching
```typescript
// Cache loaded GLB models in memory
const modelCache = new Map<string, THREE.Object3D>();

async function loadGlassesWithCache(modelUrl: string) {
  if (modelCache.has(modelUrl)) {
    return modelCache.get(modelUrl)!.clone(); // Clone to avoid mutation
  }
  
  const model = await loadGLB(modelUrl);
  modelCache.set(modelUrl, model);
  return model.clone();
}
```

### Optimization 4: Debounce Rendering
```typescript
// When switching glasses rapidly, debounce re-render
const debouncedRender = useMemo(
  () => debounce(render, 100),
  [render]
);
```

## Security Notes
**What security measures are in place?**

### Input Validation:
```typescript
// Validate file type
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Validate file size
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

### XSS Prevention:
- Never use `dangerouslySetInnerHTML` with user input
- Sanitize file names before display
- No `eval()` or dynamic script execution

### CORS:
```typescript
// Backend API should set proper CORS headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Content Security Policy:
```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net;
  worker-src 'self' blob:;
  img-src 'self' blob: data: ${process.env.MINIO_URL};
  connect-src 'self' ${process.env.API_URL} ${process.env.MINIO_URL};
`;
```

