"use client"

import { useState } from "react"
import { useProductDetail } from "@/features/products/hooks/use-product-detail"
import { useCartStore } from "@/stores/cart.store"
import { VirtualTryOnDialog } from "@/features/ar/components/virtual-tryon-dialog"
import { ProductDetailSkeleton } from "@/components/skeletons/product-detail-skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, Scan } from "lucide-react"

interface ProductDetailContentProps {
    productId: string
}

export function ProductDetailContent({ productId }: ProductDetailContentProps) {
    const { product, loading, error } = useProductDetail(productId)
    const { addItem, isLoading: isAddingToCart } = useCartStore()
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false)

    if (loading) {
        return <ProductDetailSkeleton />
    }

    if (error || !product) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
            </div>
        )
    }

    const handleAddToCart = async () => {
        await addItem(product.id, quantity)
    }

    return (
        <>
            <div className="container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/products?category=${product.category}`}>
                                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
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
                                src={product.images[selectedImage] || "/placeholder.svg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                            {product.originalPrice && (
                                <Badge className="absolute top-4 right-4" variant="destructive">
                                    Sale
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((image, index) => (
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
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-balance">{product.name}</h1>
                            <p className="text-lg text-muted-foreground mt-2">{product.brand}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium">{product.rating}</span>
                            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold">${product.price}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="ml-2 font-medium capitalize">{product.category}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Frame Type:</span>
                                    <span className="ml-2 font-medium capitalize">{product.frameType}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Material:</span>
                                    <span className="ml-2 font-medium">{product.material}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Color:</span>
                                    <span className="ml-2 font-medium">{product.color}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold mb-3">Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Separator />

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full bg-transparent"
                            onClick={() => setTryOnDialogOpen(true)}
                            disabled={!product.inStock}
                        >
                            <Scan className="mr-2 h-5 w-5" />
                            Try Virtual Fitting
                        </Button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={!product.inStock}
                                    >
                                        -
                                    </Button>
                                    <span className="w-12 text-center">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={!product.inStock}
                                    >
                                    </Button>
                                </div>
                                <Button
                                    className="flex-1"
                                    size="lg"
                                    disabled={!product.inStock || isAddingToCart}
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    {isAddingToCart ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                                    <Heart className="mr-2 h-5 w-5" />
                                    Wishlist
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <span>Free shipping on orders over $50</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <span>1-year warranty included</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                <span>30-day return policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <VirtualTryOnDialog
                open={tryOnDialogOpen}
                onOpenChange={setTryOnDialogOpen}
                product={product}
                onSwitchProduct={() => {
                    console.log("[v0] Switch to another product")
                }}
            />
        </>
    )
}