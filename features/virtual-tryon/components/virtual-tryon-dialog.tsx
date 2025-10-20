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
      startWebcam()
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
      alert("Unable to access webcam. Please check your permissions.")
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

  const retakePhoto = () => {
    setCapturedImage(null)
    startWebcam()
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
          <DialogTitle>Virtual Try-On</DialogTitle>
          <DialogDescription>See how {product.name} looks on you</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            </div>
            <Badge variant="secondary">${product.price}</Badge>
          </div>

          {/* Webcam/Preview Area */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Starting camera...</p>
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
                    Position your face in the frame
                  </p>
                </div>
              </div>
            )}

            {/* Product Overlay Placeholder */}
            {isWebcamActive && !capturedImage && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                AR overlay will be implemented here
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
                  Retake Photo
                </Button>
                <Button onClick={downloadPhoto}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="icon" onClick={switchCamera} disabled={isLoading}>
                  <SwitchCamera className="h-4 w-4" />
                  <span className="sr-only">Switch camera</span>
                </Button>
                <Button size="lg" onClick={capturePhoto} disabled={!isWebcamActive || isLoading}>
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
                {onSwitchProduct && (
                  <Button variant="outline" onClick={onSwitchProduct}>
                    Try Another Product
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Info Banner */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> This is a UI preview. The actual AR face detection and glasses overlay will be
              implemented using a suitable AR library (e.g., MediaPipe, TensorFlow.js) when integrated with your chosen
              technology.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
