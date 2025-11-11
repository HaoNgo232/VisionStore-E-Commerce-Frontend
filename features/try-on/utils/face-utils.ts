/**
 * Face Utilities
 * Calculations for positioning glasses based on face landmarks
 */

import type { FaceLandmarks } from "../types/try-on.types";

/**
 * Calculate glasses position (x, y, z) from face landmarks
 * Position is centered between eyes, slightly above eye level (on nose bridge)
 */
export function calculateGlassesPosition(landmarks: FaceLandmarks): {
  x: number;
  y: number;
  z: number;
} {
  // Calculate center point between eyes
  const centerX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;

  // Position slightly above center (on nose bridge)
  // Nose bridge is typically 2-3% above eye center
  const positionX = centerX;
  const positionY = landmarks.noseBridge.y; // Use nose bridge Y directly
  const positionZ = 0; // 2D overlay, no depth

  return {
    x: positionX,
    y: positionY,
    z: positionZ,
  };
}

/**
 * Calculate glasses scale factor from face landmarks
 * Scale is based on face width (distance between ears)
 */
export function calculateGlassesScale(landmarks: FaceLandmarks): number {
  // Base scale on face width
  // Empirical formula: scale = faceWidth * multiplier
  // Multiplier can be adjusted based on testing
  const baseScale = landmarks.faceWidth * 2.5;

  // Apply min/max constraints to prevent extreme sizes
  const minScale = 0.15; // Minimum scale (for very small faces)
  const maxScale = 0.8; // Maximum scale (for very large faces)

  return Math.max(minScale, Math.min(maxScale, baseScale));
}

/**
 * Calculate glasses rotation angles from face landmarks
 * Rotation accounts for head tilt/angle
 */
export function calculateGlassesRotation(landmarks: FaceLandmarks): {
  x: number;
  y: number;
  z: number;
} {
  // Z-axis rotation (head tilt left/right)
  const rotationZ = landmarks.faceAngle;

  // X-axis rotation (head looking up/down) - can be calculated from nose position
  // For now, keep it simple with just Z rotation
  const rotationX = 0;

  // Y-axis rotation (head turning left/right) - minimal for frontal faces
  const rotationY = 0;

  return {
    x: rotationX,
    y: rotationY,
    z: rotationZ,
  };
}

/**
 * Calculate complete glasses transform from face landmarks
 * Returns position, scale, and rotation in one call
 */
export function calculateGlassesTransform(landmarks: FaceLandmarks): {
  position: { x: number; y: number; z: number };
  scale: number;
  rotation: { x: number; y: number; z: number };
} {
  return {
    position: calculateGlassesPosition(landmarks),
    scale: calculateGlassesScale(landmarks),
    rotation: calculateGlassesRotation(landmarks),
  };
}
