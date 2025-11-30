/**
 * Product Image Upload Component
 * Drag & drop image uploader with preview for admin product forms
 */

"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductImageUploadProps {
    readonly value?: File | null;
    readonly onChange: (file: File | null) => void;
    readonly previewUrl?: string | null; // For edit mode - existing image URL
    readonly error?: string | undefined;
    readonly disabled?: boolean;
}

export function ProductImageUpload({
    value,
    onChange,
    previewUrl,
    error,
    disabled = false,
}: ProductImageUploadProps): React.ReactElement {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate preview URL from File object
    const handleFileSelect = (file: File): void => {
        // Validate file type
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            const errorMessage = "Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP";
            setLocalError(errorMessage);
            toast.error(errorMessage);
            onChange(null);
            setPreview(null);
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            const errorMessage = "Kích thước file không được vượt quá 5MB";
            setLocalError(errorMessage);
            toast.error(errorMessage);
            onChange(null);
            setPreview(null);
            return;
        }

        // Clear error on success
        setLocalError(null);

        // Update form value immediately
        onChange(file);

        // Create preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (): void => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) {
            return;
        }

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = (): void => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleClick();
        }
    };

    // Use preview from File or existing previewUrl
    // Priority: 1. Local preview from selected file, 2. Existing previewUrl from server
    const displayPreview = preview ?? (previewUrl && !value ? previewUrl : null);

    // Determine border style
    const getBorderStyle = (): string => {
        if (isDragging && !disabled) {
            return "border-primary bg-primary/5";
        }
        if (error || localError) {
            return "border-destructive";
        }
        return "border-muted-foreground/25";
    };

    // Combine prop error and local error for display
    const displayError = error ?? localError;

    return (
        <div className="space-y-2">
            {/* Using div instead of button to support drag & drop functionality */}
            {/* Accessibility: tabIndex, aria-label, keyboard handlers, and focus styles are provided */}
            <div
                tabIndex={disabled ? -1 : 0}
                aria-label="Upload product image"
                aria-disabled={disabled}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                    getBorderStyle(),
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled}
                />

                {displayPreview ? (
                    <div className="space-y-3">
                        {/* Responsive container: smaller on desktop, full width on mobile */}
                        <div className="relative group aspect-video md:aspect-square w-full md:max-w-xs mx-auto bg-muted rounded-md overflow-hidden">
                            {/* Use native img for preview to avoid Next.js Image re-render issues with data URLs */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={displayPreview}
                                alt="Product preview"
                                className="w-full h-full object-contain rounded-md"
                            />
                            {/* Hover overlay - subtle */}
                            {!disabled && (
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                            )}
                        </div>

                        {/* Action buttons below preview - always visible */}
                        {!disabled && (
                            <div className="flex gap-2 justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent event bubbling to parent div
                                        handleClick();
                                    }}
                                    className="gap-2"
                                >
                                    <Upload className="size-4" />
                                    Thay đổi ảnh
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ImageIcon className="size-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium mb-2">
                            Kéo thả ảnh vào đây hoặc click để chọn
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            JPEG, PNG hoặc WebP (tối đa 5MB)
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClick}
                            disabled={disabled}
                            className="gap-2"
                        >
                            <Upload className="size-4" />
                            Chọn ảnh
                        </Button>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
            )}

            {value && (
                <p className="text-xs text-muted-foreground">
                    File: {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            )}
        </div>
    );
}
