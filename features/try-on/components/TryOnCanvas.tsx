"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

export interface TryOnCanvasProps {
    resultCanvas: HTMLCanvasElement | null;
    isProcessing: boolean;
    className?: string;
}

export function TryOnCanvas({
    resultCanvas,
    isProcessing,
    className,
}: Readonly<TryOnCanvasProps>): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Update canvas when result changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !resultCanvas) {
            return;
        }

        // Copy result canvas to display canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        // Set display canvas size to match result canvas
        canvas.width = resultCanvas.width;
        canvas.height = resultCanvas.height;

        // Draw result canvas onto display canvas
        ctx.drawImage(resultCanvas, 0, 0);
    }, [resultCanvas]);

    const renderContent = (): React.JSX.Element => {
        if (isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">
                        Processing your try-on...
                    </p>
                </div>
            );
        }

        if (resultCanvas) {
            return (
                <div className="relative w-full">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto rounded-lg border border-muted"
                        style={{ maxHeight: "600px" }}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageIcon className="h-16 w-16 mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">No result to display</p>
                <p className="text-xs text-muted-foreground">
                    Upload an image and select glasses to see your try-on result
                </p>
            </div>
        );
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="p-6">{renderContent()}</CardContent>
        </Card>
    );
}

