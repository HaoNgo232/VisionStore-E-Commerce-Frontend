/**
 * useFaceDetection Hook
 * MediaPipe Face Landmarker integration for detecting face landmarks
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { FaceLandmarks } from "../types/try-on.types";
import { TryOnError, TryOnErrorCode } from "../types/try-on.types";

/**
 * Extract key landmarks from MediaPipe's 478-point landmark array
 * Key indices reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */
function extractKeyLandmarks(
  rawLandmarks: NormalizedLandmark[]
): FaceLandmarks {
  // MediaPipe Face Landmarker returns 478 landmarks
  // Key indices for glasses positioning
  const noseBridge = rawLandmarks[6] ?? { x: 0, y: 0, z: 0 }; // Top of nose
  const leftEye = rawLandmarks[33] ?? { x: 0, y: 0, z: 0 }; // Left eye center
  const rightEye = rawLandmarks[263] ?? { x: 0, y: 0, z: 0 }; // Right eye center
  const leftEar = rawLandmarks[234] ?? { x: 0, y: 0, z: 0 }; // Left ear
  const rightEar = rawLandmarks[454] ?? { x: 0, y: 0, z: 0 }; // Right ear

  // Calculate face width (distance between ears)
  const faceWidth = Math.abs(leftEar.x - rightEar.x);

  // Calculate face angle (rotation/tilt)
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const faceAngle = Math.atan2(dy, dx);

  return {
    noseBridge: { x: noseBridge.x, y: noseBridge.y },
    leftEye: { x: leftEye.x, y: leftEye.y },
    rightEye: { x: rightEye.x, y: rightEye.y },
    leftEar: { x: leftEar.x, y: leftEar.y },
    rightEar: { x: rightEar.x, y: rightEar.y },
    faceWidth,
    faceAngle,
  };
}

export function useFaceDetection(): {
  detectFace: (image: HTMLImageElement) => Promise<FaceLandmarks>;
  isLoading: boolean;
  error: string | null;
} {
  const [faceLandmarker, setFaceLandmarker] =
    useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    let isMounted = true;

    async function loadMediaPipe(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        // Load WASM files from CDN
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // Create Face Landmarker instance
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU", // Use GPU for better performance
          },
          numFaces: 1, // Only detect 1 face (as per requirements)
          runningMode: "IMAGE", // Static image mode (not video)
        });

        if (isMounted) {
          setFaceLandmarker(landmarker);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load MediaPipe";
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    }

    void loadMediaPipe();

    return () => {
      isMounted = false;
    };
  }, []);

  // Detect face in image
  const detectFace = useCallback(
    async (image: HTMLImageElement): Promise<FaceLandmarks> => {
      if (!faceLandmarker) {
        throw new TryOnError(
          "Face detector not initialized",
          TryOnErrorCode.RENDERING_FAILED,
          "Hệ thống đang khởi tạo. Vui lòng thử lại sau."
        );
      }

      try {
        // Detect face landmarks
        const result = faceLandmarker.detect(image);

        // Check for no face detected
        if (result.faceLandmarks.length === 0) {
          throw new TryOnError(
            "No face detected in image",
            TryOnErrorCode.NO_FACE_DETECTED,
            "Không tìm thấy khuôn mặt trong ảnh. Vui lòng sử dụng ảnh selfie rõ mặt, ánh sáng tốt."
          );
        }

        // Check for multiple faces
        if (result.faceLandmarks.length > 1) {
          throw new TryOnError(
            `Multiple faces detected (${result.faceLandmarks.length})`,
            TryOnErrorCode.MULTIPLE_FACES,
            "Phát hiện nhiều hơn 1 khuôn mặt trong ảnh. Vui lòng sử dụng ảnh chỉ có 1 người."
          );
        }

        // Extract key landmarks
        const landmarks = extractKeyLandmarks(result.faceLandmarks[0] ?? []);
        return landmarks;
      } catch (err) {
        // Re-throw TryOnError as-is
        if (err instanceof TryOnError) {
          throw err;
        }

        // Wrap other errors
        throw new TryOnError(
          err instanceof Error ? err.message : "Face detection failed",
          TryOnErrorCode.RENDERING_FAILED,
          "Lỗi khi xử lý ảnh. Vui lòng thử lại với ảnh khác."
        );
      }
    },
    [faceLandmarker]
  );

  return { detectFace, isLoading, error };
}

