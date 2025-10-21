import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="flex gap-8">
                {/* Filters Sidebar Skeleton */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-9 w-20" />
                        </div>

                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-5 w-32" />
                                <div className="space-y-2">
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Products Grid Skeleton */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-48" />
                    </div>

                    <ProductGridSkeleton count={12} />
                </div>
            </div>
        </div>
    )
}
