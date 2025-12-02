---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: glasses-try-on-simple
---

# Implementation Guide - Glasses Try-On Simple

## Development Setup

### Prerequisites and Dependencies

```bash
# Install face-api.js
pnpm add face-api.js

# Install types (if available)
pnpm add -D @types/face-api.js
```

### Environment Setup Steps

1. **Download face-api.js Models**

   - Create directory: `public/models/`
   - Download models từ: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   - Required models:
     - `ssd_mobilenetv1_model-weights_manifest.json` + weights files
     - `face_landmark_68_model-weights_manifest.json` + weights files
   - Place in `public/models/` directory

2. **Verify Model Loading**

   ```typescript
   // Test script
   import * as faceapi from "face-api.js";

   await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
   await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
   console.log("Models loaded successfully");
   ```

3. **Backend API Setup** (if needed)

   - Ensure endpoint `GET /api/products?hasTryOn=true` exists
   - Ensure products have `tryOnImageUrl` field
   - Configure CORS for frontend domain

### Configuration Needed

- **Next.js Config**: No special config needed (models in `public/` are served automatically)
- **TypeScript Config**: May need to add types for face-api.js if not available
- **ESLint Config**: May need to allow dynamic imports for face-api.js

## Code Structure

### Directory Structure

```
features/ar/
├── components/
│   ├── try-on-modal.tsx          # Main modal component
│   ├── webcam-capture.tsx         # Webcam capture component
│   ├── product-selector.tsx       # Product selection carousel
│   └── result-preview.tsx         # Result preview & download
├── hooks/
│   ├── use-webcam.ts              # Webcam management hook
│   ├── use-face-detector.ts       # Face detection hook
│   └── use-glasses-overlay.ts     # Glasses overlay hook
├── services/
│   └── glasses-try-on.service.ts  # API service
├── types/
│   └── glasses-try-on.types.ts    # Type definitions
└── utils/
    ├── face-detection.utils.ts    # Face detection utilities
    └── overlay.utils.ts           # Overlay calculation utilities
```

### Module Organization

- **Components**: UI components, client-side only (`'use client'`)
- **Hooks**: Reusable logic hooks
- **Services**: API integration layer
- **Types**: TypeScript type definitions + Zod schemas
- **Utils**: Pure utility functions (no side effects)

### Naming Conventions

- **Components**: PascalCase, descriptive names (`TryOnModal`, `WebcamCapture`)
- **Hooks**: camelCase with `use` prefix (`useWebcam`, `useFaceDetector`)
- **Services**: camelCase with `Service` suffix (`glassesTryOnService`)
- **Types**: PascalCase interfaces (`ProductWithTryOn`, `FaceLandmarks`)
- **Utils**: camelCase functions (`calculateOverlayConfig`, `renderOverlay`)

## Implementation Notes

### Core Features

#### Feature 1: Webcam Capture

**Implementation Approach:**

```typescript
// hooks/use-webcam.ts
export function useWebcam() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsReady(true);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  const capture = (): string | null => {
    if (!videoRef.current || !isReady) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/png");
  };

  return { videoRef, isReady, isLoading, error, start, stop, capture };
}
```

**Key Points:**

- Cleanup stream on unmount
- Handle permission denied gracefully
- Support both front and back camera (mobile)

#### Feature 2: Face Detection

**Implementation Approach:**

```typescript
// hooks/use-face-detector.ts
import * as faceapi from "face-api.js";

export function useFaceDetector() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        setIsModelLoaded(true);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load models"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadModels();
  }, []);

  const detectFace = async (
    image: HTMLImageElement | HTMLCanvasElement,
  ): Promise<FaceLandmarks | null> => {
    if (!isModelLoaded) {
      throw new Error("Face detection model not loaded");
    }

    try {
      const detection = await faceapi
        .detectSingleFace(image)
        .withFaceLandmarks();

      if (!detection) {
        return null;
      }

      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Calculate center points
      const leftEyeCenter = {
        x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
        y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
      };

      const rightEyeCenter = {
        x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
        y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
      };

      return {
        leftEye: leftEyeCenter,
        rightEye: rightEyeCenter,
        confidence: detection.detection.score,
      };
    } catch (err) {
      console.error("Face detection error:", err);
      return null;
    }
  };

  return { isModelLoaded, isLoading, error, detectFace };
}
```

**Key Points:**

- Lazy load models on first use
- Cache models in IndexedDB (optional optimization)
- Handle no face detected gracefully

#### Feature 3: Glasses Overlay

**Implementation Approach:**

```typescript
// hooks/use-glasses-overlay.ts
export function useGlassesOverlay() {
  const overlayGlasses = async (
    faceImage: HTMLImageElement,
    glassesImageUrl: string,
    landmarks: FaceLandmarks,
  ): Promise<string> => {
    // Load glasses image
    const glassesImage = await loadImage(glassesImageUrl);

    // Calculate overlay config
    const config = calculateOverlayConfig(landmarks, glassesImage);

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = faceImage.width;
    canvas.height = faceImage.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Draw face image
    ctx.drawImage(faceImage, 0, 0);

    // Draw glasses overlay
    ctx.save();
    ctx.translate(config.position.x, config.position.y);
    ctx.scale(config.scale, config.scale);
    ctx.drawImage(
      glassesImage,
      -glassesImage.width / 2,
      -glassesImage.height / 2,
      glassesImage.width,
      glassesImage.height,
    );
    ctx.restore();

    // Export to blob URL
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to export canvas"));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        "image/png",
        1.0,
      );
    });
  };

  return { overlayGlasses };
}

// utils/overlay.utils.ts
export function calculateOverlayConfig(
  landmarks: FaceLandmarks,
  glassesImage: HTMLImageElement,
): GlassesOverlayConfig {
  // Calculate center position (between eyes)
  const centerX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
  const centerY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;

  // Calculate eye distance
  const eyeDistance = Math.sqrt(
    Math.pow(landmarks.rightEye.x - landmarks.leftEye.x, 2) +
      Math.pow(landmarks.rightEye.y - landmarks.leftEye.y, 2),
  );

  // Calculate scale (adjust multiplier based on testing)
  const scale = (eyeDistance / glassesImage.width) * 1.5;

  return {
    position: { x: centerX, y: centerY },
    scale,
    rotation: 0, // Simplified, can add rotation later
    width: glassesImage.width * scale,
    height: glassesImage.height * scale,
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
```

**Key Points:**

- Calculate scale based on eye distance
- Handle CORS for glasses images
- Export to blob URL for download

### Patterns & Best Practices

#### Error Handling Pattern

```typescript
// Always use try-catch for async operations
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  // Log error for debugging
  console.error("Operation failed:", error);

  // Return user-friendly error
  throw new Error("User-friendly error message");
}
```

#### Loading State Pattern

```typescript
// Always show loading states
const [isLoading, setIsLoading] = useState(false);

const handleOperation = async () => {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
};
```

#### Type Safety Pattern

```typescript
// Always validate API responses with Zod
const response = await api.get("/products");
const validated = ProductsWithTryOnSchema.parse(response.data);
```

## Integration Points

### API Integration Details

```typescript
// services/glasses-try-on.service.ts
export class GlassesTryOnService extends BaseApiService {
  async getProductsWithTryOn(query?: {
    page?: number;
    pageSize?: number;
  }): Promise<ProductsWithTryOnResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("hasTryOn", "true");
    if (query?.page) searchParams.set("page", query.page.toString());
    if (query?.pageSize)
      searchParams.set("pageSize", query.pageSize.toString());

    const response = await this.get<ProductsWithTryOnResponse>(
      `/products?${searchParams.toString()}`,
    );

    // Validate response
    return ProductsWithTryOnResponseSchema.parse(response);
  }
}

// React Query hook
export function useProductsWithTryOn(query?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: glassesTryOnKeys.products(query),
    queryFn: () => glassesTryOnService.getProductsWithTryOn(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Third-Party Service Setup

**face-api.js:**

- Models served from `public/models/` (static files)
- No API key or authentication needed
- Models loaded on-demand (lazy loading)

## Error Handling

### Error Handling Strategy

1. **User-Facing Errors**: Show toast notifications với clear messages
2. **Developer Errors**: Log to console với full error details
3. **Recoverable Errors**: Provide retry options
4. **Fatal Errors**: Show error state với option to restart flow

### Error Types

```typescript
// Define error types
export class TryOnError extends Error {
  constructor(
    message: string,
    public code:
      | "PERMISSION_DENIED"
      | "NO_FACE_DETECTED"
      | "IMAGE_LOAD_FAILED"
      | "OVERLAY_FAILED",
  ) {
    super(message);
    this.name = "TryOnError";
  }
}
```

### Logging Approach

```typescript
// Use console.error for development
// In production, can integrate with error tracking service (Sentry, etc.)
console.error("[TryOn] Error:", error);
```

### Retry/Fallback Mechanisms

- **Model Load Fail**: Retry 3 times với exponential backoff
- **Face Detection Fail**: Show error, allow user to retry với different image
- **Image Load Fail**: Show error, allow user to select different product

## Performance Considerations

### Optimization Strategies

1. **Lazy Load Models**: Only load face-api.js models when needed
2. **Cache Models**: Store models in IndexedDB after first load
3. **Image Optimization**: Use Next.js Image component for product thumbnails
4. **Canvas Optimization**: Limit canvas size, use requestAnimationFrame if needed

### Caching Approach

```typescript
// Cache face detection models in IndexedDB
const CACHE_KEY = "face-api-models";
const CACHE_VERSION = 1;

async function loadModelsWithCache() {
  // Check cache first
  const cached = await getFromIndexedDB(CACHE_KEY);
  if (cached && cached.version === CACHE_VERSION) {
    // Load from cache
    return cached.models;
  }

  // Load from network
  const models = await loadModelsFromNetwork();

  // Cache for next time
  await saveToIndexedDB(CACHE_KEY, { models, version: CACHE_VERSION });

  return models;
}
```

### Resource Management

- **Cleanup Webcam Stream**: Always stop tracks on unmount
- **Cleanup Blob URLs**: Revoke blob URLs when no longer needed
- **Dispose Canvas**: Clear canvas references when done

## Security Notes

### Authentication/Authorization

- **Public Feature**: No authentication required
- **Webcam Access**: Requires user permission (browser native)

### Input Validation

- **Image Size**: Limit image size (max 10MB)
- **Image Format**: Validate image format (PNG, JPEG)
- **URL Validation**: Validate glasses image URLs from backend

### Data Encryption

- **No Sensitive Data**: Images only stored in memory/browser
- **No Server Upload**: Images not sent to server (client-side only)

### Secrets Management

- **No Secrets**: No API keys or secrets needed for this feature
