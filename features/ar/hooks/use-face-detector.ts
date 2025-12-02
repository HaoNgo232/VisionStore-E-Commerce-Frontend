/**
 * useFaceDetector Hook
 * Loads face-api.js models and detects face landmarks
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { FaceLandmarks } from "@/features/ar/types/glasses-try-on.types";
import {
  loadFaceApiModels,
  detectFaceLandmarks,
} from "@/features/ar/utils/face-detection.utils";

export interface UseFaceDetectorReturn {
  isModelLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  detectFace: (
    image: HTMLImageElement | HTMLCanvasElement,
  ) => Promise<FaceLandmarks | null>;
  reloadModels: () => Promise<void>;
}

export function useFaceDetector(): UseFaceDetectorReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadModels = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const timeoutMs = 30000;

      const timeoutPromise = new Promise<never>((_, reject) => {
        globalThis.setTimeout(() => {
          reject(
            new Error(
              "Tải model nhận diện khuôn mặt quá lâu (trên 30 giây). Vui lòng kiểm tra kết nối mạng và thử lại.",
            ),
          );
        }, timeoutMs);
      });

      await Promise.race([loadFaceApiModels(), timeoutPromise]);
      setIsModelLoaded(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error("Failed to load models");
      setError(errorMessage);
      setIsModelLoaded(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load face-api.js models on mount
  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  const detectFace = useCallback(
    async (
      image: HTMLImageElement | HTMLCanvasElement,
    ): Promise<FaceLandmarks | null> => {
      if (!isModelLoaded) {
        throw new Error("Face detection model not loaded");
      }

      return detectFaceLandmarks(image);
    },
    [isModelLoaded],
  );

  return {
    isModelLoaded,
    isLoading,
    error,
    detectFace,
    reloadModels: loadModels,
  };
}
