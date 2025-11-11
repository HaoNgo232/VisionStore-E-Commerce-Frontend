"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ShoppingCart, Save } from "lucide-react";
import { downloadCanvas } from "../utils/canvas-utils";
import { cn } from "@/lib/utils";

export interface ResultActionsProps {
    resultCanvas: HTMLCanvasElement | null;
    selectedGlassesId: string | null;
    className?: string;
    onSave?: () => Promise<void>;
    onAddToCart?: (glassesId: string) => void;
}

export function ResultActions({
    resultCanvas,
    selectedGlassesId,
    className,
    onSave,
    onAddToCart,
}: Readonly<ResultActionsProps>): React.JSX.Element {
    const handleDownload = (): void => {
        if (!resultCanvas) {
            return;
        }

        const filename = `try-on-${selectedGlassesId ?? "result"}-${Date.now()}.png`;
        downloadCanvas(resultCanvas, filename);
    };

    const handleSave = async (): Promise<void> => {
        if (!onSave) {
            return;
        }

        try {
            await onSave();
        } catch (error) {
            console.error("Failed to save result:", error);
        }
    };

    const handleAddToCart = (): void => {
        if (!selectedGlassesId || !onAddToCart) {
            return;
        }

        onAddToCart(selectedGlassesId);
    };

    const hasResult = resultCanvas !== null;
    const canSave = hasResult && onSave !== undefined;
    const canAddToCart = hasResult && selectedGlassesId !== null && onAddToCart !== undefined;

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleDownload}
                        disabled={!hasResult}
                        variant="default"
                        className="flex-1 min-w-[120px]"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>

                    {canSave && (
                        <Button
                            onClick={() => {
                                void handleSave();
                            }}
                            disabled={!hasResult}
                            variant="outline"
                            className="flex-1 min-w-[120px]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    )}

                    {canAddToCart && (
                        <Button
                            onClick={handleAddToCart}
                            disabled={!hasResult || !selectedGlassesId}
                            variant="outline"
                            className="flex-1 min-w-[120px]"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

