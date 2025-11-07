'use client'

import { useState } from "react"
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
import { ShoppingCart, Truck, Shield } from "lucide-react"
import { useCartStore } from "@/stores/cart.store"
import { formatPrice } from "@/features/products/utils"

interface ProductDetailContentProps {
    productId?: string
    productSlug?: string
}

export function ProductDetailContent({ productId, productSlug }: ProductDetailContentProps): JSX.Element {
    const { product, loading, error } = useProductDetail({ id: productId, slug: productSlug })
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
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
    const attributes = product.attributes || null

    const handleAddToCart = async () => {
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
                    {product.categoryId && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/products?categoryId=${product.categoryId}`}>
                                    {product.category?.name || "Danh mục"}
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
                        <img
                            src={product.imageUrls[selectedImage] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {product.imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.imageUrls.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-transparent"
                                        }`}
                                >
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt={`${product.name} ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
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
                    {attributes && (attributes.brand || attributes.frameShape || attributes.frameMaterial || attributes.color) && (
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

                    {/* Quantity and Add to Cart */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Số lượng:</label>
                            <div className="flex items-center border rounded-lg">
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
                            onClick={handleAddToCart}
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
        </div>
    )
}