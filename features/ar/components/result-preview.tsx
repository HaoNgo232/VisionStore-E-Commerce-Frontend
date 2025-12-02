/**
 * Result Preview Component
 * Displays try-on result and handles download
 */

"use client";

import type { JSX } from "react";
import type { TryOnResult } from "../types/glasses-try-on.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, Camera } from "lucide-react";
import { toast } from "sonner";

interface ResultPreviewProps {
  readonly result: TryOnResult;
  readonly onTryAnother: () => void;
  readonly onRetake: () => void;
}

export function ResultPreview({
  result,
  onTryAnother,
  onRetake,
}: ResultPreviewProps): JSX.Element {
  const handleDownload = (): void => {
    const link = document.createElement("a");
    link.href = result.resultImage;
    link.download = `glasses-try-on-${result.productName}-${result.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Đã bắt đầu tải ảnh kết quả về máy của bạn.");
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">
          Kết quả thử kính: {result.productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Ảnh gốc
              </p>
              <div className="rounded-lg border overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.originalImage}
                  alt="Original capture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Ảnh đã ghép kính
              </p>
              <div className="rounded-lg border overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.resultImage}
                  alt="Try-on result"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="gap-2"
              onClick={handleDownload}
              aria-label="Tải ảnh kết quả thử kính về máy"
            >
              <Download className="h-4 w-4" />
              Tải ảnh
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={onTryAnother}
              aria-label="Thử một mẫu kính khác trên cùng ảnh"
            >
              <RefreshCw className="h-4 w-4" />
              Thử kính khác
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={onRetake}
              aria-label="Chụp lại ảnh khuôn mặt để thử kính"
            >
              <Camera className="h-4 w-4" />
              Chụp lại
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

