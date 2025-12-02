/**
 * Webcam Capture Component
 * Handles webcam access and image capture
 */

"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { useWebcam } from "@/features/ar/hooks/use-webcam";
import { toast } from "sonner";

interface WebcamCaptureProps {
  readonly onCapture: (imageData: string) => void; // base64 or blob URL
  readonly onError?: (error: Error) => void;
}

export function WebcamCapture({
  onCapture,
  onError,
}: WebcamCaptureProps): JSX.Element {
  const { videoRef, isReady, isLoading, error, start, stop, capture } =
    useWebcam();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start webcam on mount
  useEffect(() => {
    void start();

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      const getErrorMessage = (): string => {
        if (error.name === "NotAllowedError") {
          return "Không thể truy cập webcam. Vui lòng cho phép quyền truy cập camera.";
        }
        if (error.name === "NotFoundError") {
          return "Không tìm thấy camera. Vui lòng kiểm tra thiết bị của bạn.";
        }
        return "Không thể truy cập webcam. Vui lòng thử lại.";
      };

      toast.error(getErrorMessage());
      onError?.(error);
    }
  }, [error, onError]);

  const handleCapture = (): void => {
    const imageData = capture();
    if (imageData) {
      setCapturedImage(imageData);
      onCapture(imageData);
      toast.success("Đã chụp ảnh thành công. Đang tiến hành nhận diện khuôn mặt...");
    } else {
      toast.error("Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleRetake = async (): Promise<void> => {
    setCapturedImage(null);
    // Restart webcam after clearing captured image
    stop();
    // Small delay to ensure cleanup completes
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    void start();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video Preview / Captured Image */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Đang khởi động camera...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-destructive">
                {error.name === "NotAllowedError"
                  ? "Quyền truy cập camera bị từ chối"
                  : "Lỗi khi truy cập camera"}
              </p>
            </div>
          </div>
        )}

        {capturedImage ? (
          // Sử dụng <img> thay vì <Image /> của Next.js vì:
          // 1. Ảnh chụp được là một dữ liệu base64 (data:image/png;base64,...)
          // 2. Component Image của Next.js yêu cầu URL ngoài hoặc static import
          // 3. Next.js Image không hỗ trợ tối ưu hóa ảnh base64 data URL
          // 4. Đây chỉ là ảnh tạm lấy được từ camera, không phải asset tĩnh
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }} // Mirror effect
          />
        )}

        {/* Overlay Guide */}
        {isReady && !capturedImage && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-64 h-48 border-2 border-dashed border-white/50 rounded-lg" />
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                Đặt khuôn mặt của bạn trong khung
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {capturedImage ? (
          <Button
            onClick={() => {
              void handleRetake();
            }}
            variant="outline"
            aria-label="Chụp lại ảnh khuôn mặt bằng camera"
          >
            Chụp lại
          </Button>
        ) : (
          <Button
            onClick={handleCapture}
            disabled={!isReady || isLoading}
            className="gap-2"
            aria-label="Chụp ảnh khuôn mặt bằng camera"
          >
            <Camera className="h-4 w-4" />
            Chụp ảnh
          </Button>
        )}
      </div>
    </div>
  );
}

