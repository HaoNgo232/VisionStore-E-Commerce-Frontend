/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, SwitchCamera, Download, X, Loader2 } from "lucide-react"
import type { Product } from "@/types"
import { toast } from "sonner"

interface VirtualTryOnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  onSwitchProduct?: () => void
}

export function VirtualTryOnDialog({ open, onOpenChange, product, onSwitchProduct }: VirtualTryOnDialogProps) {
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (open && !capturedImage) {
      void startWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [open, facingMode])

  const startWebcam = async () => {
    try {
      setIsLoading(true)

      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsWebcamActive(true)
      }
    } catch (error) {
      console.error("[v0] Failed to access webcam:", error)
      toast.error("Không thể truy cập webcam. Vui lòng kiểm tra quyền truy cập của bạn.")
    } finally {
      setIsLoading(false)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsWebcamActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)
        stopWebcam()
      }
    }
  }

  const retakePhoto = (): void => {
    setCapturedImage(null)
    void startWebcam()
  }

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.href = capturedImage
      link.download = `virtual-tryon-${product.name.replace(/\s+/g, "-").toLowerCase()}.png`
      link.click()
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    setCapturedImage(null)
  }

  const handleClose = () => {
    stopWebcam()
    setCapturedImage(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Thử kính ảo</DialogTitle>
          <DialogDescription>Xem {product.name} trông như thế nào trên bạn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <img
              src={product.imageUrls[0] || "/placeholder.svg"}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
            </div>
            <Badge variant="secondary">${product.priceInt}</Badge>
          </div>

          {/* Webcam/Preview Area */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Đang khởi động camera...</p>
                </div>
              </div>
            )}

            {capturedImage ? (
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="h-full w-full object-cover" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
            )}

            {/* Overlay Guide */}
            {isWebcamActive && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-64 h-48 border-2 border-dashed border-white/50 rounded-lg" />
                  <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                    Đặt khuôn mặt của bạn trong khung
                  </p>
                </div>
              </div>
            )}

            {/* Product Overlay Placeholder */}
            {isWebcamActive && !capturedImage && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                Lớp phủ AR sẽ được triển khai ở đây
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={retakePhoto}>
                  <Camera className="mr-2 h-4 w-4" />
                  Chụp lại
                </Button>
                <Button onClick={downloadPhoto}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải xuống
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="icon" onClick={switchCamera} disabled={isLoading}>
                  <SwitchCamera className="h-4 w-4" />
                  <span className="sr-only">Chuyển camera</span>
                </Button>
                <Button size="lg" onClick={capturePhoto} disabled={!isWebcamActive || isLoading}>
                  <Camera className="mr-2 h-5 w-5" />
                  Chụp ảnh
                </Button>
                {onSwitchProduct && (
                  <Button variant="outline" onClick={onSwitchProduct}>
                    Thử sản phẩm khác
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Info Banner */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>Lưu ý:</strong> Đây là bản xem trước giao diện. Tính năng nhận diện khuôn mặt AR và lớp phủ kính thực tế sẽ được
              triển khai bằng thư viện AR phù hợp (ví dụ: MediaPipe, TensorFlow.js) khi tích hợp với công nghệ bạn chọn.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
