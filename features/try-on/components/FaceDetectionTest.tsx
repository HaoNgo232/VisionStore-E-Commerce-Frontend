/**
 * FaceDetectionTest Component
 * Test component for verifying face detection functionality
 */

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFaceDetection } from "@/features/try-on/hooks/useFaceDetection";
import type { FaceLandmarks } from "@/features/try-on/types/try-on.types";


export function FaceDetectionTest(): React.JSX.Element {
    const { detectFace, isLoading, error } = useFaceDetection();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
    const [detectionError, setDetectionError] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setDetectionError("Vui lòng chọn file ảnh (JPEG, PNG, WebP)");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setDetectionError("File quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB");
            return;
        }

        setSelectedFile(file);
        setDetectionError(null);
        setLandmarks(null);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Detect face in uploaded image
    const handleDetectFace = async (): Promise<void> => {
        if (!selectedFile || !imagePreview) {
            return;
        }

        setIsDetecting(true);
        setDetectionError(null);

        try {
            // Create image element
            const img = new Image();
            img.crossOrigin = "anonymous"; // Allow CORS for blob URLs

            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    // Verify image has valid dimensions
                    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                        reject(new Error("Image has invalid dimensions"));
                        return;
                    }
                    imageRef.current = img;
                    resolve();
                };
                img.onerror = () => {
                    reject(new Error("Failed to load image"));
                };
                img.src = imagePreview;
            });

            // Detect face
            const detectedLandmarks = await detectFace(img);
            setLandmarks(detectedLandmarks);

            // Visualize landmarks on canvas
            // Wait for React state update and DOM render
            setTimeout(() => {
                const imgElement = imageRef.current;
                const canvas = canvasRef.current;
                if (imgElement && canvas) {
                    visualizeLandmarks(imgElement, detectedLandmarks);
                }
            }, 200);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
            setDetectionError(errorMessage);
            setLandmarks(null);
            console.error("[FaceDetectionTest] Detection error:", err);
        } finally {
            setIsDetecting(false);
        }
    };

    // Visualize landmarks on canvas (debug mode)
    const visualizeLandmarks = (
        img: HTMLImageElement,
        detectedLandmarks: FaceLandmarks
    ): void => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        // Get displayed image size (not original size)
        // Use getBoundingClientRect for accurate displayed size
        const rect = img.getBoundingClientRect();
        const displayedWidth = Math.floor(rect.width);
        const displayedHeight = Math.floor(rect.height);

        // Debug: Check if visualization is being called
        // console.warn("[FaceDetectionTest] Visualizing landmarks:", displayedWidth, displayedHeight);

        // Set canvas internal resolution to match displayed size
        canvas.width = displayedWidth;
        canvas.height = displayedHeight;

        // Set canvas CSS size to match exactly (no stretching)
        canvas.style.width = `${displayedWidth}px`;
        canvas.style.height = `${displayedHeight}px`;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";

        // Scale landmarks from normalized coordinates (0-1) to canvas pixels
        const scaleX = displayedWidth;
        const scaleY = displayedHeight;

        // Draw landmarks
        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        // Nose bridge
        ctx.beginPath();
        ctx.arc(
            detectedLandmarks.noseBridge.x * scaleX,
            detectedLandmarks.noseBridge.y * scaleY,
            5,
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Left eye
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(
            detectedLandmarks.leftEye.x * scaleX,
            detectedLandmarks.leftEye.y * scaleY,
            5,
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Right eye
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(
            detectedLandmarks.rightEye.x * scaleX,
            detectedLandmarks.rightEye.y * scaleY,
            5,
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Draw line between eyes (for glasses position reference)
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            detectedLandmarks.leftEye.x * scaleX,
            detectedLandmarks.leftEye.y * scaleY
        );
        ctx.lineTo(
            detectedLandmarks.rightEye.x * scaleX,
            detectedLandmarks.rightEye.y * scaleY
        );
        ctx.stroke();

        // Draw face width line (between ears)
        ctx.strokeStyle = "purple";
        ctx.beginPath();
        ctx.moveTo(
            detectedLandmarks.leftEar.x * scaleX,
            detectedLandmarks.leftEar.y * scaleY
        );
        ctx.lineTo(
            detectedLandmarks.rightEar.x * scaleX,
            detectedLandmarks.rightEar.y * scaleY
        );
        ctx.stroke();

        // Draw nose bridge position (where glasses will sit)
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(
            detectedLandmarks.noseBridge.x * scaleX,
            detectedLandmarks.noseBridge.y * scaleY,
            8,
            0,
            2 * Math.PI
        );
        ctx.fill();
    };

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-3">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Face Detection Test</CardTitle>
                    <CardDescription className="text-xs">
                        Upload ảnh để test face detection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* File Input */}
                    <div className="space-y-1">
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            disabled={isLoading || isDetecting}
                        />
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-xs text-muted-foreground">
                            Đang khởi tạo MediaPipe...
                        </div>
                    )}

                    {/* Error from MediaPipe initialization */}
                    {error && (
                        <div className="text-xs text-destructive">
                            Lỗi: {error}
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="space-y-2">
                            <div className="relative max-w-xs mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imageRef}
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-w-full h-auto max-h-64 border rounded-md block"
                                    onLoad={(e) => {
                                        // Update canvas size when image loads/resizes
                                        if (landmarks && canvasRef.current) {
                                            const img = e.currentTarget;
                                            visualizeLandmarks(img, landmarks);
                                        }
                                    }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 pointer-events-none"
                                    style={{
                                        display: landmarks ? "block" : "none",
                                        zIndex: 10,
                                    }}
                                />
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        void handleDetectFace();
                                    }}
                                    disabled={isLoading || isDetecting || !imagePreview}
                                >
                                    {isDetecting ? "Đang xử lý..." : "Detect Face"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Detection Error */}
                    {detectionError && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-xs text-destructive">{detectionError}</p>
                        </div>
                    )}

                    {/* Landmarks Info - Compact */}
                    {landmarks && (
                        <div className="p-3 bg-muted/50 rounded-md">
                            <p className="text-xs font-semibold mb-2">Face Landmarks:</p>
                            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                                <div>Nose: ({landmarks.noseBridge.x.toFixed(2)}, {landmarks.noseBridge.y.toFixed(2)})</div>
                                <div>L Eye: ({landmarks.leftEye.x.toFixed(2)}, {landmarks.leftEye.y.toFixed(2)})</div>
                                <div>R Eye: ({landmarks.rightEye.x.toFixed(2)}, {landmarks.rightEye.y.toFixed(2)})</div>
                                <div>Width: {landmarks.faceWidth.toFixed(2)}</div>
                                <div className="col-span-2">Angle: {(landmarks.faceAngle * (180 / Math.PI)).toFixed(1)}°</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

