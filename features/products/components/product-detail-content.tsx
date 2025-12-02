"use client"

import { useState } from "react"
import type { JSX } from "react"
import Image from "next/image"
import { ShoppingCart, Truck, Shield, Sparkles } from "lucide-react"

import { useProductDetail } from "@/features/products/hooks/use-product-detail"
import { ProductDetailSkeleton } from "@/components/skeletons/product-detail-skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCartStore } from "@/stores/cart.store"
import { formatPrice } from "@/features/products/utils"
import { TryOnModal } from "@/features/ar/components/try-on-modal"

interface ProductDetailContentProps {
    readonly productId?: string
    readonly productSlug?: string
}

export function ProductDetailContent({ productId, productSlug }: ProductDetailContentProps): JSX.Element {
    const { product, loading, error } = useProductDetail({
        ...(productId ? { id: productId } : {}),
        ...(productSlug ? { slug: productSlug } : {})
    })
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const [isTryOnOpen, setIsTryOnOpen] = useState(false)
    const addItem = useCartStore((state) => state.addItem)

    if (loading) {
        return <ProductDetailSkeleton />
    }

    if (error || !product) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Sản phẩm không tồn tại</h1>
                <p className="text-muted-foreground mt-2">Sản phẩm bạn tìm kiếm không tồn tại.</p>
            </div>
        )
    }

    const price = formatPrice(product.priceInt)
    const inStock = product.stock > 0
    const attributes = product.attributes ?? null
    const hasTryOn = Boolean(attributes?.tryOnImageUrl)

    const handleAddToCart = async (): Promise<void> => {
        setIsAdding(true)
        try {
            await addItem(product.id, quantity)
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="container py-8">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
                    </BreadcrumbItem>
                    {product.category?.slug && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/products?categorySlug=${product.category.slug}`}>
                                    {product.category?.name ?? "Danh mục"}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    )}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Images */}
                <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image
                            src={product.imageUrls[selectedImage] ?? "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                    {product.imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.imageUrls.map((image, index) => {
                                const imageKey = `product-image-${product.id}-${index}`
                                return (
                                    <button
                                        key={imageKey}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-transparent"
                                            }`}
                                    >
                                        <Image
                                            src={image ?? "/placeholder.svg"}
                                            alt={`${product.name} ${index + 1}`}
                                            fill
                                            className="object-contain"
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                    {/* Title and Stock */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        {!inStock && (
                            <Badge variant="destructive">Hết hàng</Badge>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <span className="text-4xl font-bold">{price}</span>
                        <p className="text-muted-foreground">SKU: {product.sku}</p>
                    </div>

                    <Separator />

                    {/* Attributes */}
                    {attributes && ((attributes.brand ?? attributes.frameShape ?? attributes.frameMaterial ?? attributes.color) !== null) && (
                        <div className="space-y-3">
                            {attributes.brand && (
                                <div>
                                    <span className="text-sm font-medium">Hãng:</span>
                                    <p className="text-sm text-muted-foreground">{attributes.brand}</p>
                                </div>
                            )}
                            {attributes.frameShape && (
                                <div>
                                    <span className="text-sm font-medium">Kiểu khung:</span>
                                    <p className="text-sm text-muted-foreground">{attributes.frameShape}</p>
                                </div>
                            )}
                            {attributes.frameMaterial && (
                                <div>
                                    <span className="text-sm font-medium">Chất liệu khung:</span>
                                    <p className="text-sm text-muted-foreground">{attributes.frameMaterial}</p>
                                </div>
                            )}
                            {attributes.color && (
                                <div>
                                    <span className="text-sm font-medium">Màu sắc:</span>
                                    <p className="text-sm text-muted-foreground">{attributes.color}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Try-on & Quantity / Add to Cart */}
                    <div className="space-y-4">
                        {hasTryOn && (
                            <div className="space-y-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-center gap-2"
                                    onClick={() => setIsTryOnOpen(true)}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Thử kính trực tuyến
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Dùng camera để xem kính này trên khuôn mặt bạn. Ảnh chỉ xử lý trên trình duyệt.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <label htmlFor="quantity" className="text-sm font-medium">Số lượng:</label>
                            <div id="quantity" className="flex items-center border rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={!inStock}
                                >
                                    −
                                </Button>
                                <span className="px-4 py-2">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={!inStock || quantity >= product.stock}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!inStock || isAdding}
                            onClick={() => {
                                void handleAddToCart()
                            }}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {inStock ? "Thêm vào giỏ hàng" : "Hết hàng"}
                        </Button>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">Miễn phí vận chuyển</p>
                                <p className="text-xs text-muted-foreground">Cho đơn hàng trên 500,000₫</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">Bảo hành chính hãng</p>
                                <p className="text-xs text-muted-foreground">Bảo hành 12 tháng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {product.description && (
                <div className="mt-12">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList>
                            <TabsTrigger value="description">Mô tả</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="mt-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <p>{product.description}</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {hasTryOn && (
                <TryOnModal
                    open={isTryOnOpen}
                    onOpenChange={setIsTryOnOpen}
                    productId={product.id}
                />
            )}
        </div>
    )
}