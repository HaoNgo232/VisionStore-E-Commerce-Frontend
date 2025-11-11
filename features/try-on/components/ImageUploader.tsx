"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
    onImageSelect: (file: File, previewUrl: string) => void;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    className?: string;
}

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({
    onImageSelect,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
    className,
}: Readonly<ImageUploaderProps>): React.JSX.Element {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file type
            if (!acceptedTypes.includes(file.type)) {
                return `File type not supported. Please upload ${acceptedTypes.join(", ")}`;
            }

            // Check file size
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                return `File size exceeds ${maxSizeMB}MB limit`;
            }

            return null;
        },
        [acceptedTypes, maxSizeMB],
    );

    const handleFile = useCallback(
        (file: File): void => {
            setError(null);
            setIsLoading(true);

            // Validate file
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                setIsLoading(false);
                return;
            }

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    setPreviewUrl(result);
                    setIsLoading(false);
                    onImageSelect(file, result);
                }
            };
            reader.onerror = () => {
                setError("Failed to read file");
                setIsLoading(false);
            };
            reader.readAsDataURL(file);
        },
        [validateFile, onImageSelect],
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );

    const handleClick = useCallback((): void => {
        fileInputRef.current?.click();
    }, []);

    const handleClear = useCallback((): void => {
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="p-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="Upload image"
                />

                {previewUrl ? (
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleClear}
                            aria-label="Remove image"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50",
                            isLoading && "opacity-50 pointer-events-none",
                        )}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading image...</p>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm font-medium mb-2">
                                    Drag and drop your image here
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    or click to browse
                                </p>
                                <Button onClick={handleClick} variant="outline" type="button">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Image
                                </Button>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Supported: {acceptedTypes.join(", ")} (max {maxSizeMB}MB)
                                </p>
                            </>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

