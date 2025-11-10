/**
 * Product Image Upload Component
 * Drag & drop image uploader with preview for admin product forms
 */

"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate preview URL from File object
    const handleFileSelect = (file: File): void => {
        // Validate file type
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            onChange(null);
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            onChange(null);
            return;
        }

        onChange(file);

        // Create preview URL
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

    const handleRemove = (): void => {
        onChange(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
    const displayPreview = preview ?? (previewUrl && !value ? previewUrl : null);

    // Determine border style
    const getBorderStyle = (): string => {
        if (isDragging && !disabled) {
            return "border-primary bg-primary/5";
        }
        if (error) {
            return "border-destructive";
        }
        return "border-muted-foreground/25";
    };

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
                    <div className="relative group">
                        <Image
                            src={displayPreview}
                            alt="Product preview"
                            width={400}
                            height={192}
                            className="w-full h-48 object-cover rounded-md"
                            unoptimized // For local file previews
                        />
                        {!disabled && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="gap-2"
                                >
                                    <X className="size-4" />
                                    Xóa ảnh
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

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {value && (
                <p className="text-xs text-muted-foreground">
                    File: {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            )}
        </div>
    );
}

