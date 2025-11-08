---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: virtual-glasses-try-on
---

# Implementation Guide - Virtual Glasses Try-On

## Development Setup

### Prerequisites

```bash
# Backend (NestJS)
Node.js >= 18.x
PostgreSQL >= 14.x
Docker + Docker Compose (for MinIO)

# Frontend (Next.js)
Node.js >= 18.x
npm hoặc yarn
```

### Environment Setup Steps

#### 1. Backend Setup

```bash
cd backend-luan-van

# Install dependencies
npm install

# Setup MinIO (nếu chưa có)
docker-compose up -d minio

# Run migrations
npm run migration:run

# Seed data
npm run seed:glasses

# Start dev server
npm run start:dev
```

#### 2. Frontend Setup

```bash
cd frontend-luan-van

# Install new dependencies
npm install three @types/three
npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl
npm install @tensorflow-models/face-landmarks-detection

# Setup local HTTPS (required for webcam)
npm install -g mkcert
mkcert -install
mkcert localhost

# Update next.config.js to use HTTPS in dev
# (see config below)

# Start dev server
npm run dev
```

#### 3. Next.js HTTPS Config

```typescript
// next.config.js
const fs = require("fs");
const path = require("path");

module.exports = {
  // ... existing config

  // Development HTTPS
  async devServer(options, { config, dev }) {
    return {
      ...options,
      server: {
        type: "https",
        options: {
          key: fs.readFileSync(path.join(__dirname, "localhost-key.pem")),
          cert: fs.readFileSync(path.join(__dirname, "localhost.pem")),
        },
      },
    };
  },
};
```

### Configuration Needed

#### MinIO CORS Configuration

```bash
# Connect to MinIO container
docker exec -it minio-container mc config host add local http://localhost:9000 minioadmin minioadmin

# Set CORS policy
docker exec -it minio-container mc anonymous set-json cors.json 3d-models

# cors.json content:
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://localhost:3000", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

#### Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_3D_MODELS=3d-models

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://localhost:4000
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

---

## Code Structure

### Directory Structure - Backend

```
backend/src/
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   ├── entities/
│   │   └── product.entity.ts          # Extended với virtual try-on fields
│   └── dto/
│       ├── product-response.dto.ts
│       └── virtual-try-on-config.dto.ts
│
├── try-on-history/                      # NEW MODULE
│   ├── try-on-history.controller.ts
│   ├── try-on-history.service.ts
│   ├── try-on-history.module.ts
│   ├── entities/
│   │   └── try-on-history.entity.ts
│   └── dto/
│       ├── create-try-on-history.dto.ts
│       └── try-on-history-response.dto.ts
│
├── minio/
│   ├── minio.service.ts                # Extended với 3D model methods
│   └── minio.module.ts
│
└── scripts/
    └── seed-data/
        ├── 3d-models/                  # Copy 7 folders từ reference
        │   ├── glasses-01/
        │   ├── glasses-02/
        │   └── ...
        ├── upload-3d-models.ts
        └── glasses-products.seed.ts
```

### Directory Structure - Frontend

```
frontend/src/
├── app/
│   └── products/
│       └── [id]/
│           ├── page.tsx                # Product detail with "Try On" button
│           └── try-on/
│               └── page.tsx            # Optional: dedicated try-on page
│
├── features/
│   └── virtual-try-on/
│       ├── components/
│       │   ├── VirtualTryOnModal.tsx   # Main container
│       │   ├── WebcamView.tsx          # Video + Canvas
│       │   ├── GlassesSelector.tsx     # Model picker
│       │   ├── TryOnControls.tsx       # Buttons
│       │   ├── LoadingScreen.tsx       # Model loading state
│       │   ├── ErrorScreen.tsx         # Error states
│       │   └── TryOnHistory.tsx        # History list
│       │
│       ├── hooks/
│       │   ├── useWebcam.ts            # Webcam lifecycle
│       │   ├── useFacemesh.ts          # TensorFlow face detection
│       │   ├── useThreeScene.ts        # Three.js scene setup
│       │   ├── useGlassesRenderer.ts   # Render + tracking logic
│       │   ├── useScreenshot.ts        # Screenshot capture
│       │   └── useTryOnHistory.ts      # React Query hooks
│       │
│       ├── lib/
│       │   ├── webcam-manager.ts       # WebRTC wrapper
│       │   ├── facemesh-detector.ts    # TensorFlow detector class
│       │   ├── three-scene-manager.ts  # Three.js scene utilities
│       │   ├── gltf-loader.ts          # Model loader with cache
│       │   ├── tracking-calculator.ts  # Position/rotation math
│       │   └── screenshot-capture.ts   # Canvas to image
│       │
│       ├── services/
│       │   └── virtual-try-on.service.ts # API client
│       │
│       ├── types/
│       │   └── virtual-try-on.types.ts # Zod schemas + types
│       │
│       └── constants/
│           └── face-keypoints.ts       # Facemesh landmark IDs
│
└── components/
    └── ui/
        └── product-card.tsx            # Add "Try On" badge
```

### Naming Conventions

- Components: PascalCase (`VirtualTryOnModal.tsx`)
- Hooks: camelCase với prefix `use` (`useWebcam.ts`)
- Services: camelCase với suffix `.service` (`virtual-try-on.service.ts`)
- Types: PascalCase (`VirtualTryOnConfig`)
- Constants: UPPER_SNAKE_CASE (`FACE_KEYPOINTS`)

---

## Implementation Notes

### Core Features Implementation

#### Feature 1: Webcam Management

**Implementation Approach**:

- Sử dụng native WebRTC `getUserMedia` API
- Lifecycle management với React hooks
- Error handling cho permission denied

**Key Code Pattern**:

```typescript
// lib/webcam-manager.ts
export class WebcamManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async start(
    videoEl: HTMLVideoElement,
    facingMode: "user" | "environment" = "user",
  ) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      videoEl.srcObject = this.stream;
      this.videoElement = videoEl;

      return new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => {
          videoEl.play();
          resolve();
        };
      });
    } catch (error) {
      if (error.name === "NotAllowedError") {
        throw new Error("PERMISSION_DENIED");
      }
      throw error;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  async flip() {
    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
    this.stop();
    if (this.videoElement) {
      await this.start(this.videoElement, newFacingMode);
    }
  }

  private getCurrentFacingMode() {
    const track = this.stream?.getVideoTracks()[0];
    return track?.getSettings().facingMode || "user";
  }
}

// hooks/useWebcam.ts
export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<WebcamManager>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    managerRef.current = new WebcamManager();
    return () => {
      managerRef.current?.stop();
    };
  }, []);

  const start = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      await managerRef.current?.start(videoRef.current);
      setIsReady(true);
    } catch (err) {
      setError((err as Error).message);
      setIsReady(false);
    }
  }, []);

  const stop = useCallback(() => {
    managerRef.current?.stop();
    setIsReady(false);
  }, []);

  const flip = useCallback(async () => {
    await managerRef.current?.flip();
  }, []);

  return { videoRef, isReady, error, start, stop, flip };
}
```

---

#### Feature 2: Face Detection với TensorFlow.js

**Implementation Approach**:

- Load MediaPipe Facemesh model once
- Detection loop với requestAnimationFrame
- Extract 4 keypoints: midEye, leftEye, rightEye, noseBottom

**Key Code Pattern**:

```typescript
// lib/facemesh-detector.ts
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

export const FACE_KEYPOINTS = {
  midEye: 168,
  leftEye: 143,
  noseBottom: 2,
  rightEye: 372,
} as const;

export class FacemeshDetector {
  private model: faceLandmarksDetection.FaceLandmarksDetector | null = null;

  async loadModel() {
    await tf.setBackend("webgl");
    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 },
    );
  }

  async detectFaces(videoElement: HTMLVideoElement) {
    if (!this.model) throw new Error("Model not loaded");

    const predictions = await this.model.estimateFaces({
      input: videoElement,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: false,
    });

    return predictions.map((prediction) => ({
      scaledMesh: prediction.scaledMesh,
      keypoints: {
        midEye: prediction.scaledMesh[FACE_KEYPOINTS.midEye],
        leftEye: prediction.scaledMesh[FACE_KEYPOINTS.leftEye],
        rightEye: prediction.scaledMesh[FACE_KEYPOINTS.rightEye],
        noseBottom: prediction.scaledMesh[FACE_KEYPOINTS.noseBottom],
      },
    }));
  }
}

// hooks/useFacemesh.ts
export function useFacemesh(videoRef: React.RefObject<HTMLVideoElement>) {
  const [landmarks, setLandmarks] = useState<FaceLandmarks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const detectorRef = useRef<FacemeshDetector>();
  const animationRef = useRef<number>();

  useEffect(() => {
    const detector = new FacemeshDetector();
    detectorRef.current = detector;

    detector
      .loadModel()
      .then(() => setIsLoading(false))
      .catch(console.error);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading || !videoRef.current) return;

    const detectLoop = async () => {
      if (!videoRef.current) return;

      const faces = await detectorRef.current?.detectFaces(videoRef.current);
      setLandmarks(faces || []);

      animationRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, videoRef]);

  return { landmarks, isLoading };
}
```

---

#### Feature 3: Three.js Scene & Glasses Rendering

**Implementation Approach**:

- Setup scene với camera matching video dimensions
- Load GLTF models với caching
- Calculate position/rotation từ face landmarks
- Render loop synchronized với detection

**Key Code Pattern**:

```typescript
// lib/three-scene-manager.ts
import * as THREE from "three";

export class ThreeSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  constructor(
    canvasElement: HTMLCanvasElement,
    videoWidth: number,
    videoHeight: number,
  ) {
    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup (match video dimensions)
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    this.camera.position.x = videoWidth / 2;
    this.camera.position.y = -videoHeight / 2;
    this.camera.position.z =
      -(videoHeight / 2) / Math.tan((45 * Math.PI) / 180 / 2);
    this.camera.lookAt(videoWidth / 2, -videoHeight / 2, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(videoWidth, videoHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Lights
    const frontLight = new THREE.SpotLight(0xffffff, 0.3);
    frontLight.position.set(10, 10, 10);
    this.scene.add(frontLight);

    const backLight = new THREE.SpotLight(0xffffff, 0.3);
    backLight.position.set(10, 10, -10);
    this.scene.add(backLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);
    this.scene.add(this.camera);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

// lib/gltf-loader.ts
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class GLTFModelLoader {
  private loader = new GLTFLoader();
  private cache = new Map<string, THREE.Group>();

  async load(modelPath: string): Promise<THREE.Group> {
    if (this.cache.has(modelPath)) {
      return this.cache.get(modelPath)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          this.cache.set(modelPath, gltf.scene);
          resolve(gltf.scene.clone());
        },
        undefined,
        reject,
      );
    });
  }
}

// lib/tracking-calculator.ts
export function calculateGlassesTransform(
  keypoints: FaceKeypoints,
  config: VirtualTryOnConfig,
) {
  const { midEye, leftEye, rightEye, noseBottom } = keypoints;

  // Position
  const position = {
    x: midEye[0] + config.position.x,
    y: -midEye[1] + config.upOffset + config.position.y,
    z: -1000 + midEye[2] + config.position.z, // Adjust based on camera.position.z
  };

  // Up vector for rotation
  let upVector = {
    x: midEye[0] - noseBottom[0],
    y: -(midEye[1] - noseBottom[1]),
    z: midEye[2] - noseBottom[2],
  };

  // Normalize
  const length = Math.sqrt(upVector.x ** 2 + upVector.y ** 2 + upVector.z ** 2);
  upVector = {
    x: upVector.x / length,
    y: upVector.y / length,
    z: upVector.z / length,
  };

  // Scale based on eye distance
  const eyeDist = Math.sqrt(
    (leftEye[0] - rightEye[0]) ** 2 +
      (leftEye[1] - rightEye[1]) ** 2 +
      (leftEye[2] - rightEye[2]) ** 2,
  );
  const scale = eyeDist * config.scale;

  // Rotation
  const rotation = {
    x: config.rotation.x,
    y: Math.PI + config.rotation.y,
    z: Math.PI / 2 - Math.acos(upVector.x) + config.rotation.z,
  };

  return { position, rotation, scale, upVector };
}

// hooks/useGlassesRenderer.ts
export function useGlassesRenderer({
  scene,
  camera,
  renderer,
  landmarks,
  config,
}: Props) {
  const glassesRef = useRef<THREE.Group | null>(null);
  const loaderRef = useRef(new GLTFModelLoader());

  useEffect(() => {
    if (!config) return;

    loaderRef.current.load(config.modelPath).then((model) => {
      if (glassesRef.current) {
        scene.remove(glassesRef.current);
      }
      glassesRef.current = model;
      scene.add(model);
    });

    return () => {
      if (glassesRef.current) {
        scene.remove(glassesRef.current);
      }
    };
  }, [config, scene]);

  useEffect(() => {
    if (!glassesRef.current || landmarks.length === 0) return;

    const glasses = glassesRef.current;
    const face = landmarks[0];

    const { position, rotation, scale, upVector } = calculateGlassesTransform(
      face.keypoints,
      config,
    );

    glasses.position.set(position.x, position.y, position.z);
    glasses.up.set(upVector.x, upVector.y, upVector.z);
    glasses.scale.set(scale, scale, scale);
    glasses.rotation.set(rotation.x, rotation.y, rotation.z);

    renderer.render(scene, camera);
  }, [landmarks, config, scene, camera, renderer]);
}
```

---

### Patterns & Best Practices

#### Pattern 1: Type-Safe API Responses

```typescript
// Always validate API responses với Zod
const response = await fetch("/api/products/123");
const data = await response.json();
const product = ProductWithTryOnSchema.parse(data); // Runtime validation
```

#### Pattern 2: Resource Cleanup

```typescript
// Always cleanup Three.js resources
useEffect(() => {
  const manager = new ThreeSceneManager(canvas, 640, 480);

  return () => {
    manager.dispose(); // Prevent memory leaks
  };
}, []);
```

#### Pattern 3: Error Boundaries

```tsx
// Wrap risky components với Error Boundary
<ErrorBoundary fallback={<ErrorScreen />}>
  <VirtualTryOnModal />
</ErrorBoundary>
```

#### Pattern 4: Lazy Loading Heavy Dependencies

```typescript
// Lazy load Three.js để reduce initial bundle
const THREE = await import("three");
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader");
```

---

## Integration Points

### API Integration

**Backend → Frontend Data Flow**:

1. Frontend calls `GET /api/products/:id`
2. Backend returns product với `virtualTryOnConfig`
3. Backend generates pre-signed URL cho `modelPath`
4. Frontend loads GLTF từ pre-signed URL

**Try-On History Flow**:

1. User thử kính → Frontend debounces 3s
2. Frontend calls `POST /api/try-on-history` với `productId`
3. Backend upserts record (hoặc increment `tryCount`)
4. Frontend refetches history list

### Database Connections

**Product Entity**:

```typescript
// Backend query với JOIN
const products = await productRepository.find({
  where: { hasVirtualTryOn: true },
  relations: ["category"],
  order: { createdAt: "DESC" },
});
```

**Try-On History với User**:

```typescript
// Backend query
const history = await tryOnHistoryRepository.find({
  where: { userId },
  relations: ["product"],
  order: { triedAt: "DESC" },
  take: 50,
});
```

### Third-Party Service Setup

**MinIO S3 Integration**:

```typescript
// Backend MinIO service
import * as Minio from "minio";

export class MinioService {
  private client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async uploadGLTFModel(file: Buffer, productId: string, filename: string) {
    const path = `${productId}/${filename}`;
    await this.client.putObject("3d-models", path, file, {
      "Content-Type": "model/gltf+json",
    });
    return path;
  }

  async getPresignedUrl(path: string, expiry = 3600) {
    return this.client.presignedGetObject("3d-models", path, expiry);
  }
}
```

---

## Error Handling

### Error Handling Strategy

**Frontend Error Types**:

```typescript
export enum VirtualTryOnErrorType {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED",
  FACE_NOT_DETECTED = "FACE_NOT_DETECTED",
  NETWORK_ERROR = "NETWORK_ERROR",
  WEBGL_NOT_SUPPORTED = "WEBGL_NOT_SUPPORTED",
}

export class VirtualTryOnError extends Error {
  constructor(
    public type: VirtualTryOnErrorType,
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "VirtualTryOnError";
  }
}
```

**Error Handling Pattern**:

```typescript
try {
  await webcamManager.start(videoRef.current);
} catch (error) {
  if (error.message === "PERMISSION_DENIED") {
    setError({
      type: VirtualTryOnErrorType.PERMISSION_DENIED,
      message: "Vui lòng cho phép truy cập camera trong cài đặt trình duyệt",
      action: "Mở Cài Đặt",
    });
  }
}
```

### Logging Approach

**Frontend Logging**:

```typescript
// Use Sentry for production
import * as Sentry from "@sentry/nextjs";

function logError(error: VirtualTryOnError) {
  console.error("[VirtualTryOn]", error);

  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      tags: { feature: "virtual-try-on", type: error.type },
    });
  }
}
```

**Backend Logging**:

```typescript
// Use NestJS Logger
import { Logger } from "@nestjs/common";

@Injectable()
export class TryOnHistoryService {
  private readonly logger = new Logger(TryOnHistoryService.name);

  async saveTryOn(userId: string, productId: string) {
    this.logger.log(`User ${userId} tried product ${productId}`);
    // ...
  }
}
```

### Retry/Fallback Mechanisms

**Model Loading Retry**:

```typescript
async function loadModelWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await loader.load(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**:

   ```typescript
   // Code splitting cho modal
   const VirtualTryOnModal = dynamic(() => import("./VirtualTryOnModal"), {
     ssr: false,
     loading: () => <Skeleton />,
   });
   ```

2. **Throttle Detection**:

   ```typescript
   // Throttle to 24 FPS thay vì 60 FPS
   const DETECTION_INTERVAL = 1000 / 24;
   let lastDetectionTime = 0;

   function detectLoop(timestamp: number) {
     if (timestamp - lastDetectionTime >= DETECTION_INTERVAL) {
       detectFaces();
       lastDetectionTime = timestamp;
     }
     requestAnimationFrame(detectLoop);
   }
   ```

3. **Model Caching**:
   ```typescript
   // Cache loaded models trong memory
   const modelCache = new Map<string, THREE.Group>();
   ```

### Caching Approach

**Browser Caching**:

- GLTF files: `Cache-Control: public, max-age=31536000` (1 year)
- Textures: Same as above
- TensorFlow.js model: Cache in IndexedDB

**Application Caching**:

- Three.js models: In-memory cache
- API responses: React Query với `staleTime: 5 minutes`

### Query Optimization

**Database Indexes**:

```sql
-- Already in migration
CREATE INDEX idx_products_has_virtual_try_on ON products(has_virtual_try_on);
CREATE INDEX idx_try_on_history_user_tried ON try_on_history(user_id, tried_at DESC);
```

**Query Optimization**:

```typescript
// Chỉ select cần thiết fields
const products = await repository
  .createQueryBuilder("product")
  .select(["product.id", "product.name", "product.virtualTryOnConfig"])
  .where("product.hasVirtualTryOn = :hasVirtualTryOn", {
    hasVirtualTryOn: true,
  })
  .take(20)
  .getMany();
```

### Resource Management

**GPU Memory**:

- Dispose Three.js geometries/materials khi không dùng
- Limit số models trong scene (max 1-2)

**Network**:

- Pre-signed URLs với expiry để giảm load backend
- Compress textures (use WebP format nếu browser support)

---

## Security Notes

### Authentication/Authorization

**Protected Endpoints**:

```typescript
// Backend guard
@UseGuards(JwtAuthGuard)
@Controller("try-on-history")
export class TryOnHistoryController {
  @Post()
  async create(@Request() req, @Body() dto: CreateTryOnHistoryDto) {
    return this.service.saveTryOn(req.user.id, dto.productId);
  }
}
```

### Input Validation

**Zod Validation Pipeline**:

```typescript
// Backend DTO với Zod
import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

const CreateTryOnHistorySchema = z.object({
  productId: z.string().uuid(),
});

export class CreateTryOnHistoryDto extends createZodDto(
  CreateTryOnHistorySchema,
) {}
```

**Frontend Validation**:

```typescript
// Validate user input trước khi gửi API
const productId = ProductIdSchema.parse(input);
```

### Data Encryption

**In Transit**:

- HTTPS required (TLS 1.2+)
- WebSocket secure (wss://) nếu dùng

**At Rest**:

- MinIO S3 encryption enabled (optional)
- Database: PostgreSQL transparent encryption

### Secrets Management

**Environment Variables**:

```bash
# NEVER commit to git
# Use .env.local for local dev
# Use Kubernetes Secrets hoặc AWS Secrets Manager for production
```

**API Keys**:

```typescript
// Frontend không expose MinIO credentials
// Backend generates pre-signed URLs thay vì expose keys
```

---

**Next Steps**:

1. Start implementation theo planning doc
2. Use `/execute-plan` command để orchestrate tasks
3. Update implementation notes khi encounter issues
4. Proceed to Testing phase → `feature-virtual-glasses-try-on-testing.md`
