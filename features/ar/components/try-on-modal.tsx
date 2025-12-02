/**
 * Try-On Modal Component
 * Main modal orchestrator for glasses try-on flow
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { WebcamCapture } from "@/features/ar/components/webcam-capture";
import { useFaceDetector } from "@/features/ar/hooks/use-face-detector";
import { useProductsWithTryOn } from "@/features/ar/hooks/use-products-with-try-on";
import { useGlassesOverlay } from "@/features/ar/hooks/use-glasses-overlay";
import type {
    FaceLandmarks,
    ProductWithTryOn,
    TryOnResult,
} from "@/features/ar/types/glasses-try-on.types";
import { ProductSelector } from "@/features/ar/components/product-selector";
import { ResultPreview } from "@/features/ar/components/result-preview";
import { loadImage } from "@/features/ar/utils/overlay.utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TryOnStep = "capture" | "select" | "result";

interface TryOnModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly productId?: string; // Optional: pre-select product
}

export function TryOnModal({
    open,
    onOpenChange,
    productId,
}: TryOnModalProps): JSX.Element {
    const [step, setStep] = useState<TryOnStep>("capture");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(productId ?? null);
    const [detectError, setDetectError] = useState<Error | null>(null);
    const [overlayError, setOverlayError] = useState<Error | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const {
        isModelLoaded,
        isLoading: isModelLoading,
        error: modelError,
        detectFace,
        reloadModels,
    } = useFaceDetector();
    const { data: productsResponse, isLoading: isProductsLoading, error: productsError } = useProductsWithTryOn();
    const { isLoading: isOverlayLoading, overlayGlasses } = useGlassesOverlay();

    const products = useMemo(() => productsResponse?.data ?? [], [productsResponse],);

    useEffect(() => {
        if (open && productId) {
            setSelectedProductId(productId);
        }
    }, [open, productId]);

    const resetState = (): void => {
        setStep("capture");
        setCapturedImage(null);
        setFaceLandmarks(null);
        setSelectedProductId(productId ?? null);
        setDetectError(null);
        setOverlayError(null);
        setResultImage(null);
    };

    const handleModalChange = (nextOpen: boolean): void => {
        if (!nextOpen) {
            resetState();
        }
        onOpenChange(nextOpen);
    };

    const handleCapture = async (imageData: string): Promise<void> => {
        setCapturedImage(imageData);
        setFaceLandmarks(null);
        setResultImage(null);
        setStep("capture");
        setDetectError(null);
        setOverlayError(null);

        if (!isModelLoaded) {
            toast.error("Model nhận diện khuôn mặt chưa sẵn sàng, vui lòng thử lại.");
            return;
        }

        setIsDetecting(true);
        try {
            const img = await loadImage(imageData);
            const landmarks = await detectFace(img);
            if (!landmarks) {
                const err = new Error("Không tìm thấy khuôn mặt trong ảnh.");
                setDetectError(err);
                toast.error(err.message);
                return;
            }

            setFaceLandmarks(landmarks);
            setStep("select");
            toast.success("Đã nhận diện khuôn mặt, chọn kính để thử nhé!");
        } catch (error) {
            const err =
                error instanceof Error
                    ? error
                    : new Error("Không thể nhận diện khuôn mặt.");
            setDetectError(err);
            toast.error(err.message);
        } finally {
            setIsDetecting(false);
        }
    };

    const runOverlay = async (product: ProductWithTryOn): Promise<void> => {
        if (!capturedImage || !faceLandmarks) {
            toast.error("Vui lòng chụp ảnh và đảm bảo nhận diện khuôn mặt thành công.");
            return;
        }

        setOverlayError(null);
        setResultImage(null);
        try {
            const resultUrl = await overlayGlasses(
                capturedImage,
                product.tryOnImageUrl,
                faceLandmarks,
            );
            setResultImage(resultUrl);
            setStep("result");
            toast.success("Đã ghép kính thành công!");
        } catch (error) {
            const err =
                error instanceof Error ? error : new Error("Không thể ghép kính.");
            setOverlayError(err);
            toast.error(err.message);
        }
    };

    const handleSelectProduct = (id: string): void => {
        setSelectedProductId(id);
        const selectedProduct = products.find((item) => item.id === id);
        if (selectedProduct) {
            void runOverlay(selectedProduct);
        }
    };

    const handleTryAnother = (): void => {
        setResultImage(null);
        setOverlayError(null);
        setStep("select");
    };

    const handleRetake = (): void => {
        resetState();
    };

    const currentProduct = useMemo(
        () => products.find((product) => product.id === selectedProductId),
        [products, selectedProductId],
    );

    const currentResult: TryOnResult | null =
        capturedImage && resultImage && currentProduct
            ? {
                originalImage: capturedImage,
                resultImage,
                productId: currentProduct.id,
                productName: currentProduct.name,
                timestamp: Date.now(),
            }
            : null;

    const steps = [
        { key: "capture", label: "Chụp ảnh" },
        { key: "select", label: "Chọn kính" },
        { key: "result", label: "Xem kết quả" },
    ] as const;

    const renderStepContent = (): JSX.Element => {
        if (step === "capture") {
            return (
                <div className="space-y-4">
                    <WebcamCapture onCapture={(image) => void handleCapture(image)} />
                    {isModelLoading && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>Đang tải model nhận diện khuôn mặt</AlertTitle>
                            <AlertDescription>
                                Vui lòng đợi trong giây lát...
                            </AlertDescription>
                        </Alert>
                    )}

                    {modelError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Lỗi tải model</AlertTitle>
                            <AlertDescription>
                                <span className="block">{modelError.message}</span>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => {
                                        void reloadModels();
                                    }}
                                    disabled={isModelLoading}
                                >
                                    Thử tải lại model
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {detectError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Lỗi nhận diện</AlertTitle>
                            <AlertDescription>{detectError.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            );
        }

        if (step === "select") {
            return (
                <div className="space-y-4">
                    <ProductSelector
                        products={products}
                        selectedProductId={selectedProductId}
                        onSelect={handleSelectProduct}
                        isLoading={isProductsLoading}
                        error={productsError}
                    />

                    {overlayError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Lỗi ghép kính</AlertTitle>
                            <AlertDescription>{overlayError.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRetake}
                            disabled={isOverlayLoading}
                        >
                            Chụp lại
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep("capture")}
                            disabled={isOverlayLoading}
                        >
                            Quay lại bước chụp
                        </Button>
                    </div>
                </div>
            );
        }

        if (step === "result" && currentResult) {
            return (
                <ResultPreview
                    result={currentResult}
                    onTryAnother={handleTryAnother}
                    onRetake={handleRetake}
                />
            );
        }

        return (
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Sẵn sàng thử kính</AlertTitle>
                <AlertDescription>
                    Hãy chụp ảnh và chọn kính để xem kết quả.
                </AlertDescription>
            </Alert>
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleModalChange}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto sm:w-full">
                <DialogHeader>
                    <DialogTitle>Thử kính trực tuyến</DialogTitle>
                    <DialogDescription>
                        Tải mô hình AR nhẹ hoàn toàn client-side. Không lưu ảnh của bạn.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm" aria-label="Các bước thử kính">
                        {steps.map((item, index) => {
                            const isCompleted =
                                steps.findIndex((s) => s.key === step) > index;
                            const isActive = step === item.key;
                            return (
                                <div
                                    key={item.key}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                                                isActive && "bg-primary text-primary-foreground border-primary",
                                                isCompleted && "bg-primary/80 text-primary-foreground",
                                            )}
                                            aria-current={isActive ? "step" : undefined}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-sm",
                                                isActive ? "font-semibold" : "text-muted-foreground",
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <span className="text-muted-foreground/70">→</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {(isDetecting || isOverlayLoading) && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>
                                {isDetecting ? "Đang nhận diện khuôn mặt" : "Đang ghép kính"}
                            </AlertTitle>
                            <AlertDescription>
                                Vui lòng giữ nguyên ảnh và đợi trong giây lát...
                            </AlertDescription>
                        </Alert>
                    )}

                    {renderStepContent()}

                    {!isProductsLoading && products.length === 0 && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Chưa có sản phẩm hỗ trợ try-on</AlertTitle>
                            <AlertDescription>
                                Vui lòng liên hệ admin để upload ảnh PNG kính vào MinIO.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

