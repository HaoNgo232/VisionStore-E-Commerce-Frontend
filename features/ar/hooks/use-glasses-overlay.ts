/**
 * useGlassesOverlay Hook
 * Handles glasses image overlay on face image
 */

"use client";

import { useState } from "react";
import type { FaceLandmarks } from "@/features/ar/types/glasses-try-on.types";
import {
  loadImage,
  calculateOverlayConfig,
  renderOverlay,
  exportCanvasToImage,
} from "@/features/ar/utils/overlay.utils";

export interface UseGlassesOverlayReturn {
  isLoading: boolean;
  overlayGlasses: (
    faceImage: HTMLImageElement | string, // Can accept image element or base64/data URL
    glassesImageUrl: string,
    landmarks: FaceLandmarks,
  ) => Promise<string>; // Returns result image URL (blob URL)
}

export function useGlassesOverlay(): UseGlassesOverlayReturn {
  const [isLoading, setIsLoading] = useState(false);

  const overlayGlasses = async (
    faceImage: HTMLImageElement | string,
    glassesImageUrl: string,
    landmarks: FaceLandmarks,
  ): Promise<string> => {
    setIsLoading(true);

    try {
      // Convert faceImage to HTMLImageElement if it's a string (base64/data URL)
      let faceImgElement: HTMLImageElement;
      if (typeof faceImage === "string") {
        faceImgElement = await loadImage(faceImage);
      } else {
        faceImgElement = faceImage;
      }

      // Load glasses image
      const glassesImage = await loadImage(glassesImageUrl);

      // Calculate overlay configuration
      const config = calculateOverlayConfig(landmarks, glassesImage);

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = faceImgElement.width;
      canvas.height = faceImgElement.height;

      // Render overlay
      renderOverlay(canvas, faceImgElement, glassesImage, config);

      // Export to blob URL
      const resultUrl = await exportCanvasToImage(canvas);

      return resultUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error : new Error("Failed to overlay glasses");
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    overlayGlasses,
  };
}
