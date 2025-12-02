/**
 * Overlay Utilities
 * Helper functions for glasses overlay calculations and rendering
 */

import type {
  FaceLandmarks,
  GlassesOverlayConfig,
} from "@/features/ar/types/glasses-try-on.types";

/**
 * Calculate overlay configuration from face landmarks
 */
export function calculateOverlayConfig(
  landmarks: FaceLandmarks,
  glassesImage: HTMLImageElement,
): GlassesOverlayConfig {
  // Calculate center position (between eyes)
  const centerX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
  const centerY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;

  // Calculate eye distance (horizontal)
  const eyeDistance = Math.sqrt(
    Math.pow(landmarks.rightEye.x - landmarks.leftEye.x, 2) +
      Math.pow(landmarks.rightEye.y - landmarks.leftEye.y, 2),
  );

  // Tính toán độ lệch dọc: kính nên được đặt hơi thấp hơn trung tâm mắt một chút
  // Dịch xuống dưới khoảng 18-22% khoảng cách giữa hai mắt để trông tự nhiên hơn
  const verticalOffset = eyeDistance * 0.08;

  // Tính scale kính dựa vào khoảng cách 2 mắt
  // Multiplier 4 giúp kính lớn, phủ hết chiều ngang mặt, tránh bị nhỏ
  const scale = (eyeDistance / glassesImage.width) * 4;

  return {
    position: {
      x: centerX,
      y: centerY + verticalOffset, // Position glasses slightly below eye center
    },
    scale,
    rotation: 0, // Simplified, can add rotation later based on face angle
    width: glassesImage.width * scale,
    height: glassesImage.height * scale,
  };
}

/**
 * Render overlay on canvas
 */
export function renderOverlay(
  canvas: HTMLCanvasElement,
  faceImage: HTMLImageElement,
  glassesImage: HTMLImageElement,
  config: GlassesOverlayConfig,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw face image first
  ctx.drawImage(faceImage, 0, 0, canvas.width, canvas.height);

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
}

/**
 * Export canvas to image (blob URL)
 */
export function exportCanvasToImage(
  canvas: HTMLCanvasElement,
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export canvas to blob"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      "image/png",
      1, // Quality (1.0 = highest)
    );
  });
}

/**
 * Load image from URL
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
