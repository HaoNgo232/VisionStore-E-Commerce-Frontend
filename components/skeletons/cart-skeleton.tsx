import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CartItemSkeleton(): JSX.Element {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-9 w-32" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function CartSkeleton(): JSX.Element {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-9 w-48 mb-8" />

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <CartItemSkeleton key={i} />
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-6 w-32" />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>

                            <Skeleton className="h-px w-full" />

                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                            </div>

                            <Skeleton className="h-11 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
