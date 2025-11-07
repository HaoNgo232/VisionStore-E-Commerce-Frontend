"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCartStore } from "@/stores/cart.store"
import { ProductGrid } from "./product-grid"
import { ProductSort } from "./product-sort"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

export function ProductsContent() {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [categorySlug, setCategorySlug] = useState<string | undefined>()
    const [search, setSearch] = useState<string | undefined>()
    const [sortBy, setSortBy] = useState<string>("")

    // Sync search from URL params
    useEffect(() => {
        const urlSearch = searchParams.get("search")
        const urlCategory = searchParams.get("categoryId")

        if (urlSearch) {
            setSearch(urlSearch)
            setPage(1)
        }

        if (urlCategory) {
            setCategorySlug(urlCategory)
            setPage(1)
        }
    }, [searchParams])

    const { products, total, loading, error } = useProducts({
        page,
        pageSize: 12,
        categorySlug,
        search,
    })

    const totalPages = Math.ceil(total / 12)

    if (error) {
        return (
            <div className="container py-8">
                <div className="text-center">
                    <p className="text-destructive">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Tất cả sản phẩm</h1>
                <p className="text-muted-foreground mt-2">Khám phá bộ sưu tập kinh mắt hoàn chỉnh của chúng tôi</p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {loading ? "Đang tải..." : `${total} sản phẩm`}
                    </p>

                    <div className="flex items-center gap-2">
                        <ProductSort
                            value={sortBy}
                            onChange={(value) => {
                                setSortBy(value)
                                setPage(1)
                            }}
                        />
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <ProductGridSkeleton count={12} />
                ) : (products && products.length > 0) ? (
                    <>
                        <ProductGrid products={products} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Trang trước
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <Button
                                        key={p}
                                        variant={page === p ? "default" : "outline"}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Trang sau
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
                    </div>
                )}
            </div>
        </div>
    )
}