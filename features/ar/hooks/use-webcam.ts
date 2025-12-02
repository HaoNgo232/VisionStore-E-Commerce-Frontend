/**
 * useWebcam Hook
 * Manages webcam lifecycle (start/stop/capture)
 */

"use client";

import { useState, useRef, useEffect } from "react";

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => void;
  capture: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Trình duyệt của bạn không hỗ trợ truy cập webcam. Vui lòng thử trên Chrome hoặc một trình duyệt khác, hoặc dùng tính năng upload ảnh (sẽ được bổ sung sau).",
        );
      }

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

  const stop = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  const capture = (): string | null => {
    if (!videoRef.current || !isReady) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/png");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    videoRef,
    isReady,
    isLoading,
    error,
    start,
    stop,
    capture,
  };
}
