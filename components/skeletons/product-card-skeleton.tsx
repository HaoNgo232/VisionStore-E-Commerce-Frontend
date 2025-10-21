import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
            </CardContent>
        </Card>
    )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}
