"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { ProductGrid } from "./product-grid"
import { ProductList } from "./product-list"
import { ProductSort } from "./product-sort"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { ProductSearchBar } from "./product-search-bar"
import { ViewToggle } from "./view-toggle"
import { ProductsPagination } from "./products-pagination"
import { ProductFiltersSidebar } from "./product-filters-sidebar"
import { ProductFiltersSheet } from "./product-filters-sheet"
import { ActiveFilters, createActiveFilters } from "./active-filters"
import { Button } from "@/components/ui/button"
import type { JSX } from "react"

type ViewMode = "grid" | "list"

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000000]
const DEFAULT_PAGE_SIZE = 12

export function ProductsContent(): JSX.Element {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Pagination state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

    // Filter state
    const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [search, setSearch] = useState<string>("")
    const [sortBy, setSortBy] = useState<string>("")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")

    // Load categories
    const { categories, loading: categoriesLoading } = useCategories()

    // Track if initial load is done to prevent re-syncing
    const [isInitialized, setIsInitialized] = useState(false)
    const [priceRangeCalculated, setPriceRangeCalculated] = useState(false)

    // Sync URL params on mount only
    useEffect(() => {
        if (isInitialized) {
            return
        }

        const urlSearch = searchParams.get("search")
        const urlCategory = searchParams.get("categorySlug")
        const urlPage = searchParams.get("page")
        const urlPageSize = searchParams.get("pageSize")

        if (urlSearch) {
            setSearch(urlSearch)
        }

        if (urlCategory) {
            setSelectedCategories([urlCategory])
        }

        if (urlPage) {
            const pageNum = Number.parseInt(urlPage, 10)
            if (!Number.isNaN(pageNum) && pageNum > 0) {
                setPage(pageNum)
            }
        }

        if (urlPageSize) {
            const sizeNum = Number.parseInt(urlPageSize, 10)
            if (!Number.isNaN(sizeNum) && [12, 24, 48].includes(sizeNum)) {
                setPageSize(sizeNum)
            }
        }

        setIsInitialized(true)
    }, [searchParams, isInitialized])

    // Fetch filtered products - only one API call
    const productsParams = {
        page,
        pageSize,
        ...(selectedCategories.length === 1 && { categorySlug: selectedCategories[0] }),
        ...(search && { search }),
        ...(priceRange[0] !== DEFAULT_PRICE_RANGE[0] && { minPriceInt: priceRange[0] }),
        ...(priceRange[1] !== DEFAULT_PRICE_RANGE[1] && { maxPriceInt: priceRange[1] }),
    }
    const { products, total: totalProducts, loading: productsLoading, error } = useProducts(productsParams)

    // Calculate price range from first page of products (only once)
    useEffect(() => {
        if (
            products.length > 0 &&
            !priceRangeCalculated &&
            priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
            priceRange[1] === DEFAULT_PRICE_RANGE[1]
        ) {
            const prices = products.map((p) => p.priceInt)
            if (prices.length > 0) {
                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)
                // Round to nearest 10000
                const roundedMin = Math.max(0, Math.floor(minPrice / 10000) * 10000)
                const roundedMax = Math.ceil(maxPrice / 10000) * 10000
                // Only update if we have a reasonable range
                if (roundedMax > roundedMin) {
                    setPriceRange([roundedMin, roundedMax])
                    setPriceRangeCalculated(true)
                }
            }
        }
    }, [products, priceRange, priceRangeCalculated])

    // Client-side filtering
    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Filter by selected categories (if multiple selected)
        if (selectedCategories.length > 1) {
            result = result.filter((p) => selectedCategories.includes(p.category?.slug ?? ""))
        }

        // Sort products
        if (sortBy) {
            result = [...result].sort((a, b) => {
                switch (sortBy) {
                    case "price-asc":
                        return a.priceInt - b.priceInt
                    case "price-desc":
                        return b.priceInt - a.priceInt
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    case "rating":
                        // Rating sort not implemented yet
                        return 0
                    default:
                        return 0
                }
            })
        }

        return result
    }, [products, selectedCategories, sortBy])

    // Calculate pagination for filtered products
    // Use total from API if no client-side filtering, otherwise use filtered length
    const totalFiltered = selectedCategories.length > 1 || sortBy ? filteredProducts.length : totalProducts
    const totalPages = Math.ceil(totalFiltered / pageSize)
    const paginatedProducts = useMemo(() => {
        // If we're doing client-side filtering, paginate the filtered results
        if (selectedCategories.length > 1 || sortBy) {
            const start = (page - 1) * pageSize
            const end = start + pageSize
            return filteredProducts.slice(start, end)
        }
        // Otherwise, use products directly from API (already paginated)
        return products
    }, [filteredProducts, products, page, pageSize, selectedCategories.length, sortBy])

    // Update URL params when filters change (debounced to prevent too many updates)
    useEffect(() => {
        if (!isInitialized) {
            return
        }

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams()

            if (search) {
                params.set("search", search)
            }

            if (selectedCategories.length === 1 && selectedCategories[0]) {
                params.set("categorySlug", selectedCategories[0])
            }

            if (page > 1) {
                params.set("page", page.toString())
            }

            if (pageSize !== DEFAULT_PAGE_SIZE) {
                params.set("pageSize", pageSize.toString())
            }

            const queryString = params.toString()
            const newUrl = queryString ? `/products?${queryString}` : "/products"
            router.replace(newUrl, { scroll: false })
        }, 300) // Debounce 300ms

        return () => clearTimeout(timeoutId)
    }, [search, selectedCategories, page, pageSize, router, isInitialized])

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [search, selectedCategories, priceRange, sortBy])

    // Handlers
    const handleClearAllFilters = useCallback((): void => {
        setPriceRange(DEFAULT_PRICE_RANGE)
        setSelectedCategories([])
        setSearch("")
        setPage(1)
    }, [])

    const handleRemovePriceFilter = useCallback((): void => {
        setPriceRange(DEFAULT_PRICE_RANGE)
    }, [])

    const handleRemoveCategory = useCallback(
        (slug: string): void => {
            setSelectedCategories((prev) => prev.filter((c) => c !== slug))
        },
        [],
    )

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) {
            count++
        }
        count += selectedCategories.length
        return count
    }, [priceRange, selectedCategories])

    // Create active filters for display
    const activeFilters = useMemo(
        () =>
            createActiveFilters(
                priceRange,
                DEFAULT_PRICE_RANGE,
                selectedCategories,
                categories,
                handleRemovePriceFilter,
                handleRemoveCategory,
            ),
        [priceRange, selectedCategories, categories, handleRemovePriceFilter, handleRemoveCategory],
    )

    if (error) {
        return (
            <div className="container py-8">
                <div className="text-center">
                    <p className="text-destructive">{error}</p>
                </div>
            </div>
        )
    }

    const isLoading = productsLoading

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Tất cả sản phẩm</h1>
                <p className="text-muted-foreground mt-2">
                    Khám phá bộ sưu tập kính mắt hoàn chỉnh của chúng tôi
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <ProductSearchBar value={search} onChange={setSearch} />
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="mb-6">
                    <ActiveFilters filters={activeFilters} onClearAll={handleClearAllFilters} />
                </div>
            )}

            <div className="flex gap-8">
                {/* Filter Sidebar (Desktop) */}
                <ProductFiltersSidebar
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    defaultPriceRange={DEFAULT_PRICE_RANGE}
                    selectedCategories={selectedCategories}
                    onCategoriesChange={setSelectedCategories}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    onClearAll={handleClearAllFilters}
                />

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <ProductFiltersSheet
                                priceRange={priceRange}
                                onPriceRangeChange={setPriceRange}
                                defaultPriceRange={DEFAULT_PRICE_RANGE}
                                selectedCategories={selectedCategories}
                                onCategoriesChange={setSelectedCategories}
                                categories={categories}
                                categoriesLoading={categoriesLoading}
                                onClearAll={handleClearAllFilters}
                                activeFiltersCount={activeFiltersCount}
                            />
                            <p className="text-sm text-muted-foreground">
                                {isLoading ? "Đang tải..." : `${totalFiltered} sản phẩm`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <ViewToggle value={viewMode} onChange={setViewMode} />
                            <ProductSort
                                value={sortBy}
                                onChange={(value) => {
                                    setSortBy(value)
                                    setPage(1)
                                }}
                            />
                        </div>
                    </div>

                    {/* Products */}
                    {isLoading && <ProductGridSkeleton count={pageSize} />}
                    {!isLoading && paginatedProducts.length > 0 && (
                        <>
                            {viewMode === "grid" && <ProductGrid products={paginatedProducts} />}
                            {viewMode === "list" && <ProductList products={paginatedProducts} />}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <ProductsPagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    total={totalFiltered}
                                    onPageChange={setPage}
                                    onPageSizeChange={(size) => {
                                        setPageSize(size)
                                        setPage(1)
                                    }}
                                />
                            )}
                        </>
                    )}
                    {!isLoading && paginatedProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={handleClearAllFilters}
                                >
                                    Xóa tất cả bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
