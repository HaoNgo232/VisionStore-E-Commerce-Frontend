import { Progress } from "@/components/ui/progress"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/features/products/utils"

interface FreeShippingProgressProps {
    currentTotal: number
    freeShippingThreshold?: number
}

export function FreeShippingProgress({
    currentTotal,
    freeShippingThreshold = 500000 // 500,000 VND
}: FreeShippingProgressProps) {
    const progress = Math.min((currentTotal / freeShippingThreshold) * 100, 100)
    const remaining = Math.max(freeShippingThreshold - currentTotal, 0)
    const isQualified = currentTotal >= freeShippingThreshold

    return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Truck className={cn(
                    "h-5 w-5",
                    isQualified ? "text-green-600" : "text-muted-foreground"
                )} />
                <div className="flex-1">
                    {isQualified ? (
                        <p className="text-sm font-medium text-green-600">
                            🎉 Bạn được miễn phí vận chuyển!
                        </p>
                    ) : (
                        <p className="text-sm font-medium">
                            Thêm <span className="font-bold text-primary">{formatPrice(remaining)}</span> để được miễn phí vận chuyển
                        </p>
                    )}
                </div>
            </div>

            <Progress
                value={progress}
                className="h-2"
            />

            {!isQualified && (
                <p className="text-xs text-muted-foreground">
                    Đã đạt {formatPrice(currentTotal)} / {formatPrice(freeShippingThreshold)}
                </p>
            )}
        </div>
    )
}
