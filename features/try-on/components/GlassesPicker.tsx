"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

/**
 * Simplified glasses item for picker display
 */
export interface GlassesItem {
    id: string;
    name: string;
    thumbnailUrl: string;
    model3dUrl: string;
    priceInt?: number;
}

export interface GlassesPickerProps {
    onSelect: (glassesId: string, model3dUrl: string) => void;
    selectedId?: string | null;
    className?: string;
}

/**
 * Mock data for glasses - will be replaced with API call later
 */
const MOCK_GLASSES: GlassesItem[] = [
    {
        id: "mock-1",
        name: "Classic Aviator",
        thumbnailUrl: "/placeholder.jpg",
        model3dUrl: "/models/aviator.glb",
        priceInt: 199900,
    },
    {
        id: "mock-2",
        name: "Round Vintage",
        thumbnailUrl: "/placeholder.jpg",
        model3dUrl: "/models/round.glb",
        priceInt: 149900,
    },
    {
        id: "mock-3",
        name: "Cat Eye",
        thumbnailUrl: "/placeholder.jpg",
        model3dUrl: "/models/cateye.glb",
        priceInt: 179900,
    },
    {
        id: "mock-4",
        name: "Wayfarer",
        thumbnailUrl: "/placeholder.jpg",
        model3dUrl: "/models/wayfarer.glb",
        priceInt: 169900,
    },
];

export function GlassesPicker({
    onSelect,
    selectedId,
    className,
}: Readonly<GlassesPickerProps>): React.JSX.Element {
    // Using mock data for now - will be replaced with API call in Phase 3
    const [glasses] = useState<GlassesItem[]>(MOCK_GLASSES);
    const [isLoading] = useState(false);

    // Future: Replace with API call
    // useEffect(() => {
    //   const loadGlasses = async () => {
    //     setIsLoading(true);
    //     try {
    //       const data = await glassesApi.getGlasses();
    //       setGlasses(data);
    //     } catch (error) {
    //       console.error("Failed to load glasses:", error);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };
    //   void loadGlasses();
    // }, []);

    const handleSelect = (glassesItem: GlassesItem): void => {
        onSelect(glassesItem.id, glassesItem.model3dUrl);
    };

    if (isLoading) {
        return (
            <Card className={cn("w-full", className)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Choose Your Glasses</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {glasses.map((glassesItem) => {
                        const isSelected = selectedId === glassesItem.id;
                        return (
                            <button
                                key={glassesItem.id}
                                type="button"
                                onClick={() => {
                                    handleSelect(glassesItem);
                                }}
                                className={cn(
                                    "relative group rounded-lg overflow-hidden border-2 transition-all",
                                    isSelected
                                        ? "border-primary ring-2 ring-primary ring-offset-2"
                                        : "border-muted hover:border-primary/50",
                                )}
                                aria-label={`Select ${glassesItem.name}`}
                                aria-pressed={isSelected}
                            >
                                <div className="aspect-square relative bg-muted">
                                    <Image
                                        src={glassesItem.thumbnailUrl}
                                        alt={glassesItem.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 text-left">
                                    <p className="text-sm font-medium truncate">
                                        {glassesItem.name}
                                    </p>
                                    {glassesItem.priceInt !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(glassesItem.priceInt)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

