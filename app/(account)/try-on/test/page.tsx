/**
 * Test Page for Webcam Capture Component
 * Development/testing page - remove before production
 */

"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { WebcamCapture } from "@/features/ar/components/webcam-capture";
import { useFaceDetector } from "@/features/ar/hooks/use-face-detector";
import { useGlassesOverlay } from "@/features/ar/hooks/use-glasses-overlay";
import { useProductsWithTryOn } from "@/features/ar/hooks/use-products-with-try-on";
import type { FaceLandmarks } from "@/features/ar/types/glasses-try-on.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2, XCircle, Sparkles, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function WebcamTestPage(): JSX.Element {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isUserMediaAvailable, setIsUserMediaAvailable] = useState<boolean | null>(null);
    const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectionError, setDetectionError] = useState<Error | null>(null);
    const [glassesImageUrl, setGlassesImageUrl] = useState<string>("");
    const [overlayResult, setOverlayResult] = useState<string | null>(null);
    const [isOverlaying, setIsOverlaying] = useState(false);
    const [overlayError, setOverlayError] = useState<Error | null>(null);

    const { isModelLoaded, isLoading: isModelLoading, error: modelError, detectFace } = useFaceDetector();
    const { isLoading: isOverlayLoading, overlayGlasses } = useGlassesOverlay();
    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProductsWithTryOn();

    // Check User Media API availability on client side only
    useEffect(() => {
        const checkAvailability = (): void => {
            const available =
                typeof navigator !== "undefined" &&
                navigator.mediaDevices !== undefined &&
                typeof navigator.mediaDevices.getUserMedia === "function";
            setIsUserMediaAvailable(available);
        };

        checkAvailability();
    }, []);

    const handleCapture = async (imageData: string): Promise<void> => {
        // eslint-disable-next-line no-console
        console.log("Image captured:", `${imageData.substring(0, 50)}...`);
        // eslint-disable-next-line no-console
        console.log("Face detection model loaded:", isModelLoaded);
        setCapturedImage(imageData);
        setError(null);
        setFaceLandmarks(null);
        setDetectionError(null);

        // Auto-detect face after capture
        if (isModelLoaded) {
            setIsDetecting(true);
            try {
                // Convert base64 to image element
                const img = new Image();
                img.src = imageData;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const landmarks = await detectFace(img);
                if (landmarks) {
                    setFaceLandmarks(landmarks);
                    // eslint-disable-next-line no-console
                    console.log("Face detected:", landmarks);
                } else {
                    setDetectionError(new Error("Không tìm thấy khuôn mặt trong ảnh"));
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error("Lỗi khi detect face");
                setDetectionError(error);
                console.error("Face detection error:", error);
            } finally {
                setIsDetecting(false);
            }
        }
    };

    const handleError = (err: Error): void => {
        console.error("Webcam error:", err);
        setError(err);
    };

    const handleDownload = (): void => {
        if (!capturedImage) {
            return;
        }

        const link = document.createElement("a");
        link.href = capturedImage;
        link.download = `webcam-capture-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleOverlay = async (): Promise<void> => {
        if (!capturedImage || !faceLandmarks || !glassesImageUrl.trim()) {
            setOverlayError(new Error("Cần có ảnh chụp, face landmarks và URL ảnh kính"));
            return;
        }

        setIsOverlaying(true);
        setOverlayError(null);
        setOverlayResult(null);

        try {
            // Convert base64 to image element
            const img = new Image();
            img.src = capturedImage;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const resultUrl = await overlayGlasses(img, glassesImageUrl.trim(), faceLandmarks);
            setOverlayResult(resultUrl);
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Lỗi khi overlay kính");
            setOverlayError(error);
            console.error("Overlay error:", error);
        } finally {
            setIsOverlaying(false);
        }
    };

    const handleDownloadOverlay = (): void => {
        if (!overlayResult) {
            return;
        }

        const link = document.createElement("a");
        link.href = overlayResult;
        link.download = `glasses-try-on-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const renderProductsSelector = (): JSX.Element | null => {
        if (isLoadingProducts) {
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải danh sách sản phẩm...</span>
                </div>
            );
        }

        if (productsError) {
            return (
                <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300">
                        Lỗi: {productsError.message}
                    </p>
                </div>
            );
        }

        if (productsData && productsData.data.length > 0) {
            return (
                <Select
                    onValueChange={(value) => {
                        const product = productsData.data.find((p) => p.id === value);
                        if (product) {
                            setGlassesImageUrl(product.tryOnImageUrl);
                        }
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm kính..." />
                    </SelectTrigger>
                    <SelectContent>
                        {productsData.data.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>{product.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        return (
            <p className="text-xs text-muted-foreground">
                Không có sản phẩm nào có try-on image. Vui lòng nhập URL thủ công.
            </p>
        );
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Webcam Capture Test</CardTitle>
                    <CardDescription>
                        Test page for WebcamCapture component. This page should be removed
                        before production.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Webcam Component */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Webcam Capture</h3>
                        <WebcamCapture
                            onCapture={(imageData) => {
                                void handleCapture(imageData);
                            }}
                            onError={handleError}
                        />
                    </div>

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Captured Image</h3>
                            <div className="space-y-4">
                                <div className="relative w-full max-w-md mx-auto">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="w-full rounded-lg border"
                                    />
                                    {/* Face landmarks overlay */}
                                    {faceLandmarks && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Left eye */}
                                            <div
                                                className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                                                style={{
                                                    left: `${faceLandmarks.leftEye.x}px`,
                                                    top: `${faceLandmarks.leftEye.y}px`,
                                                    transform: "translate(-50%, -50%)",
                                                }}
                                            />
                                            {/* Right eye */}
                                            <div
                                                className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                                                style={{
                                                    left: `${faceLandmarks.rightEye.x}px`,
                                                    top: `${faceLandmarks.rightEye.y}px`,
                                                    transform: "translate(-50%, -50%)",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Face Detection Status */}
                                <div className="space-y-2">
                                    {isModelLoading && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang tải face detection model...</span>
                                        </div>
                                    )}
                                    {modelError && (
                                        <div className="flex items-center gap-2 text-sm text-destructive">
                                            <XCircle className="h-4 w-4" />
                                            <span>Lỗi load model: {modelError.message}</span>
                                        </div>
                                    )}
                                    {isDetecting && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang nhận diện khuôn mặt...</span>
                                        </div>
                                    )}
                                    {faceLandmarks && (
                                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 mb-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="font-semibold">Đã nhận diện khuôn mặt</span>
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-400 space-y-1 font-mono">
                                                <p>
                                                    Left Eye: ({Math.round(faceLandmarks.leftEye.x)},{" "}
                                                    {Math.round(faceLandmarks.leftEye.y)})
                                                </p>
                                                <p>
                                                    Right Eye: ({Math.round(faceLandmarks.rightEye.x)},{" "}
                                                    {Math.round(faceLandmarks.rightEye.y)})
                                                </p>
                                                <p>Confidence: {(faceLandmarks.confidence * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    )}
                                    {detectionError && (
                                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                                <XCircle className="h-4 w-4" />
                                                <span>{detectionError.message}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-center">
                                    <Button onClick={handleDownload} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </Button>
                                </div>

                                {/* Glasses Overlay Section */}
                                {faceLandmarks && (
                                    <div className="mt-6 p-4 border rounded-lg space-y-4">
                                        <h4 className="text-md font-semibold">Glasses Overlay Test</h4>

                                        {/* Products Selector */}
                                        <div className="space-y-2">
                                            <Label>Chọn sản phẩm từ API (hoặc nhập URL thủ công)</Label>
                                            {renderProductsSelector()}
                                        </div>

                                        {/* Manual URL Input */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="glasses-url">Hoặc nhập URL ảnh kính thủ công (PNG với nền trong suốt)</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        // URL mẫu từ MinIO (cần thay bằng URL thật từ backend)
                                                        // Format: http://127.0.0.1:9000/web-ban-kinh/products/...
                                                        // Hoặc URL từ CDN/public nếu có
                                                        setGlassesImageUrl("http://127.0.0.1:9000/web-ban-kinh/try-on/glasses_01.png");
                                                    }}
                                                    className="text-xs"
                                                >
                                                    Load Sample URL
                                                </Button>
                                            </div>
                                            <Input
                                                id="glasses-url"
                                                type="url"
                                                placeholder="https://example.com/glasses.png"
                                                value={glassesImageUrl}
                                                onChange={(e) => {
                                                    setGlassesImageUrl(e.target.value);
                                                }}
                                            />
                                            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    💡 <strong>Hướng dẫn test:</strong>
                                                </p>
                                                <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
                                                    <li>URL ảnh kính phải là PNG với nền trong suốt</li>
                                                    <li>URL từ MinIO: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://127.0.0.1:9000/web-ban-kinh/try-on/glasses_XX.png</code></li>
                                                    <li>Hoặc chọn sản phẩm từ dropdown trên (nếu backend đã có tryOnImageUrl)</li>
                                                    <li>Nếu gặp lỗi CORS, cần cấu hình MinIO cho phép CORS từ frontend domain</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                void handleOverlay();
                                            }}
                                            disabled={isOverlaying || isOverlayLoading || !glassesImageUrl.trim()}
                                            className="w-full gap-2"
                                        >
                                            {isOverlaying || isOverlayLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang overlay...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4" />
                                                    Overlay Glasses
                                                </>
                                            )}
                                        </Button>

                                        {overlayError && (
                                            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                                                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                                    <XCircle className="h-4 w-4" />
                                                    <span>{overlayError.message}</span>
                                                </div>
                                            </div>
                                        )}

                                        {overlayResult && (
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold">Overlay Result:</h5>
                                                <div className="relative w-full max-w-md mx-auto">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={overlayResult}
                                                        alt="Glasses overlay result"
                                                        className="w-full rounded-lg border"
                                                    />
                                                </div>
                                                <Button onClick={handleDownloadOverlay} className="w-full gap-2" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                    Download Result
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-sm text-muted-foreground text-center">
                                    <p>Image size: ~{Math.round(capturedImage.length / 1024)} KB</p>
                                    <p className="mt-1">
                                        Format: {capturedImage.startsWith("data:image/png") ? "PNG" : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                            <h3 className="text-lg font-semibold text-destructive mb-2">
                                Error
                            </h3>
                            <p className="text-sm text-destructive">
                                <strong>Name:</strong> {error.name}
                            </p>
                            <p className="text-sm text-destructive">
                                <strong>Message:</strong> {error.message}
                            </p>
                        </div>
                    )}

                    {/* Debug Info */}
                    <div className="p-4 bg-muted rounded-lg">
                        <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
                        <div className="text-xs space-y-1 font-mono">
                            <p>
                                <strong>Has captured image:</strong> {capturedImage ? "Yes" : "No"}
                            </p>
                            <p>
                                <strong>Has error:</strong> {error ? "Yes" : "No"}
                            </p>
                            <p>
                                <strong>User Media API:</strong>{" "}
                                {(() => {
                                    if (isUserMediaAvailable === null) {
                                        return "Checking...";
                                    }
                                    return isUserMediaAvailable ? "Available" : "Not Available";
                                })()}
                            </p>
                            <p>
                                <strong>Face Detection Model:</strong>{" "}
                                {(() => {
                                    if (isModelLoading) {
                                        return "Loading...";
                                    }
                                    if (isModelLoaded) {
                                        return "Loaded";
                                    }
                                    if (modelError) {
                                        return "Error";
                                    }
                                    return "Not Loaded";
                                })()}
                            </p>
                            <p>
                                <strong>Face Detected:</strong> {faceLandmarks ? "Yes" : "No"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

