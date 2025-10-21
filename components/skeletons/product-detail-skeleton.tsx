import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-md" />
                        ))}
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>

                    <Skeleton className="h-10 w-32" />

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-10 rounded-full" />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    <div className="flex gap-4">
                        <Skeleton className="h-11 flex-1" />
                        <Skeleton className="h-11 w-11 rounded-md" />
                    </div>

                    <Card>
                        <CardContent className="p-4 space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Description Skeleton */}
            <div className="mt-12 space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    )
}
