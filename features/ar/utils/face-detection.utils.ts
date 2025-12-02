/**
 * Face Detection Utilities
 * Helper functions for face detection operations
 */

import * as faceapi from "face-api.js";
import type { FaceLandmarks } from "../types/glasses-try-on.types";

let modelsLoaded = false;

/**
 * Load face-api.js models
 * Models are loaded once and cached
 */
export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) {
    return;
  }

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    modelsLoaded = true;
  } catch (error) {
    modelsLoaded = false;
    throw new Error(
      `Failed to load face-api.js models: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Detect face landmarks from image
 */
export async function detectFaceLandmarks(
  image: HTMLImageElement | HTMLCanvasElement,
): Promise<FaceLandmarks | null> {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  try {
    const detection = await faceapi.detectSingleFace(image).withFaceLandmarks();

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
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
}

/**
 * Extract eye positions from landmarks
 * (Already extracted in detectFaceLandmarks, but kept for backward compatibility)
 */
export function extractEyePositions(landmarks: FaceLandmarks): {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
} {
  return {
    leftEye: landmarks.leftEye,
    rightEye: landmarks.rightEye,
  };
}
