"use client";

import { useState, useCallback } from "react";
import type { FaceLandmarks, TryOnState } from "../types/try-on.types";

export function useTryOnState() {
  const [state, setState] = useState<TryOnState>({
    uploadedImage: null,
    imagePreviewUrl: null,
    faceLandmarks: null,
    selectedGlassesId: null,
    isProcessing: false,
    error: null,
    resultCanvas: null,
  });

  const setUploadedImage = useCallback(
    (file: File | null, previewUrl: string | null): void => {
      setState((prev) => ({
        ...prev,
        uploadedImage: file,
        imagePreviewUrl: previewUrl,
        faceLandmarks: null, // Reset landmarks when new image uploaded
        resultCanvas: null, // Reset result when new image uploaded
        error: null,
      }));
    },
    [],
  );

  const setFaceLandmarks = useCallback(
    (landmarks: FaceLandmarks | null): void => {
      setState((prev) => ({
        ...prev,
        faceLandmarks: landmarks,
        error: null,
      }));
    },
    [],
  );

  const setSelectedGlasses = useCallback((glassesId: string | null): void => {
    setState((prev) => ({
      ...prev,
      selectedGlassesId: glassesId,
      resultCanvas: null, // Reset result when glasses changed
    }));
  }, []);

  const setIsProcessing = useCallback((isProcessing: boolean): void => {
    setState((prev) => ({
      ...prev,
      isProcessing,
    }));
  }, []);

  const setError = useCallback((error: string | null): void => {
    setState((prev) => ({
      ...prev,
      error,
      isProcessing: false,
    }));
  }, []);

  const setResultCanvas = useCallback(
    (canvas: HTMLCanvasElement | null): void => {
      setState((prev) => ({
        ...prev,
        resultCanvas: canvas,
        isProcessing: false,
        error: null,
      }));
    },
    [],
  );

  const reset = useCallback((): void => {
    setState({
      uploadedImage: null,
      imagePreviewUrl: null,
      faceLandmarks: null,
      selectedGlassesId: null,
      isProcessing: false,
      error: null,
      resultCanvas: null,
    });
  }, []);

  return {
    state,
    setUploadedImage,
    setFaceLandmarks,
    setSelectedGlasses,
    setIsProcessing,
    setError,
    setResultCanvas,
    reset,
  };
}
