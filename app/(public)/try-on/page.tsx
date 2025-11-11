"use client";

import { useRef, useCallback, useEffect } from "react";
import { ImageUploader } from "@/features/try-on/components/ImageUploader";
import { GlassesPicker } from "@/features/try-on/components/GlassesPicker";
import { TryOnCanvas } from "@/features/try-on/components/TryOnCanvas";
import { ResultActions } from "@/features/try-on/components/ResultActions";
import { useTryOnState } from "@/features/try-on/hooks/useTryOnState";
import { useFaceDetection } from "@/features/try-on/hooks/useFaceDetection";
import { useTryOnRenderer } from "@/features/try-on/hooks/useTryOnRenderer";
import { compositeImageAndGlasses } from "@/features/try-on/utils/canvas-utils";
import { AlertCircle } from "lucide-react";

export default function TryOnPage(): React.JSX.Element {
  const {
    state,
    setUploadedImage,
    setFaceLandmarks,
    setSelectedGlasses,
    setIsProcessing,
    setError,
    setResultCanvas,
  } = useTryOnState();

  const { detectFace, isLoading: isFaceDetectionLoading } = useFaceDetection();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useTryOnRenderer(canvasRef as React.RefObject<HTMLCanvasElement>);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Handle image upload
  const handleImageSelect = useCallback(
    (file: File, previewUrl: string): void => {
      setUploadedImage(file, previewUrl);
      setError(null);

      // Create image element for face detection
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        imageRef.current = img;
        // Auto-detect face after image loads
        try {
          setIsProcessing(true);
          const landmarks = await detectFace(img);
          setFaceLandmarks(landmarks);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to detect face";
          setError(errorMessage);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = previewUrl;
    },
    [detectFace, setUploadedImage, setFaceLandmarks, setIsProcessing, setError],
  );

  // Handle glasses selection and rendering
  useEffect(() => {
    if (
      !renderer ||
      !state.selectedGlassesId ||
      !state.faceLandmarks ||
      !imageRef.current ||
      !state.imagePreviewUrl
    ) {
      return;
    }

    const renderTryOn = async (): Promise<void> => {
      try {
        setIsProcessing(true);
        setError(null);

        // Get glasses model URL (mock for now)
        const model3dUrl = `/models/glasses-${state.selectedGlassesId}.glb`;

        // Load glasses model
        await renderer.loadGlasses(model3dUrl);

        // Position glasses based on face landmarks
        if (!state.faceLandmarks) {
          throw new Error("Face landmarks not available");
        }
        renderer.positionGlassesFromLandmarks(state.faceLandmarks);

        // Render Three.js scene
        renderer.render();

        // Get Three.js canvas
        const glassesCanvas = renderer.getCanvas();
        if (!glassesCanvas || !imageRef.current) {
          throw new Error("Failed to get renderer canvas");
        }

        // Composite image and glasses
        const compositeCanvas = compositeImageAndGlasses(
          imageRef.current,
          glassesCanvas,
        );

        setResultCanvas(compositeCanvas);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to render try-on";
        setError(errorMessage);
        console.error("[TryOnPage] Render error:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    void renderTryOn();
  }, [
    renderer,
    state.selectedGlassesId,
    state.faceLandmarks,
    state.imagePreviewUrl,
    setIsProcessing,
    setError,
    setResultCanvas,
  ]);

  const handleGlassesSelect = useCallback(
    (glassesId: string, _model3dUrl: string): void => {
      setSelectedGlasses(glassesId);
      // _model3dUrl is stored but not used yet (will be used when API is ready)
      // console.warn("[TryOnPage] Selected glasses:", glassesId, _model3dUrl);
    },
    [setSelectedGlasses],
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Thử Kính Online</h1>
        <p className="text-muted-foreground mb-8">
          Upload ảnh của bạn để thử các mẫu kính
        </p>

        {/* Error Display */}
        {state.error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        )}

        {/* Step 1: Upload Image */}
        <div className="mb-6">
          <ImageUploader
            onImageSelect={handleImageSelect}
            maxSizeMB={10}
          />
        </div>

        {/* Step 2: Select Glasses (only show if face detected) */}
        {state.faceLandmarks && !state.isProcessing && (
          <div className="mb-6">
            <GlassesPicker
              onSelect={handleGlassesSelect}
              selectedId={state.selectedGlassesId}
            />
          </div>
        )}

        {/* Step 3: Preview Result */}
        <div className="mb-6">
          <TryOnCanvas
            resultCanvas={state.resultCanvas}
            isProcessing={state.isProcessing || isFaceDetectionLoading}
          />
        </div>

        {/* Step 4: Actions */}
        {state.resultCanvas && (
          <div className="mb-6">
            <ResultActions
              resultCanvas={state.resultCanvas}
              selectedGlassesId={state.selectedGlassesId}
            />
          </div>
        )}

        {/* Hidden canvas for Three.js renderer */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
