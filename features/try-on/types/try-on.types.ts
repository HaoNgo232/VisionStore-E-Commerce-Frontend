/**
 * Try-On Feature Types
 * Types for virtual glasses try-on functionality
 */

/**
 * Face landmarks extracted from MediaPipe Face Landmarker
 */
export interface FaceLandmarks {
  noseBridge: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  leftEar: { x: number; y: number };
  rightEar: { x: number; y: number };
  faceWidth: number;
  faceAngle: number;
}

/**
 * Try-on state management
 */
export interface TryOnState {
  uploadedImage: File | null;
  imagePreviewUrl: string | null;
  faceLandmarks: FaceLandmarks | null;
  selectedGlassesId: string | null;
  isProcessing: boolean;
  error: string | null;
  resultCanvas: HTMLCanvasElement | null;
}

/**
 * Error codes for try-on operations
 */
export enum TryOnErrorCode {
  NO_FACE_DETECTED = "NO_FACE_DETECTED",
  MULTIPLE_FACES = "MULTIPLE_FACES",
  MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED",
  RENDERING_FAILED = "RENDERING_FAILED",
  INVALID_IMAGE = "INVALID_IMAGE",
}

/**
 * Custom error class for try-on operations
 */
export class TryOnError extends Error {
  constructor(
    message: string,
    public code: TryOnErrorCode,
    public userMessage: string
  ) {
    super(message);
    this.name = "TryOnError";
  }
}

