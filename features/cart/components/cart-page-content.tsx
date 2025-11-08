"use client"

import { useCart } from "@/features/cart/hooks/use-cart"
import { CartItem } from "@/features/cart/components/cart-item"
import { CartSummary } from "@/features/cart/components/cart-summary"
import { CartSkeleton } from "@/components/skeletons/cart-skeleton"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function CartPageContent() {
    const router = useRouter()
    const {
        cart,
        loading,
        error,
        updateItem,
        removeItem,
        getItemCount,
        getTotal,
        mounted,
        isAuthenticated,
    } = useCart()

    // Debug
    // console.log("[CartPageContent] Render:", {
    //     mounted,
    //     isAuthenticated,
    //     loading,
    //     error,
    //     cartItems: cart?.items?.length,
    // })

    // Prevent hydration mismatch - render skeleton on server
    if (!mounted) {
        return <CartSkeleton />
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1>
                <p className="text-muted-foreground mt-2">Bạn cần đăng nhập để xem giỏ hàng</p>
                <Link href="/auth/login" className="text-primary hover:underline mt-4 inline-block">
                    Đăng nhập ngay
                </Link>
            </div>
        )
    }

    if (loading) {
        // console.log("[CartPageContent] Loading skeleton")
        return <CartSkeleton />
    }

    if (error) {
        // console.log("[CartPageContent] Error:", error)
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Lỗi tải giỏ hàng</h1>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                    Quay lại mua sắm
                </Link>
            </div>
        )
    }

    if (!cart?.items || cart.items.length === 0) {
        // console.log("[CartPageContent] Empty cart")
        return (
            <div className="container py-16">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
                        <p className="text-muted-foreground">
                            Chưa có sản phẩm nào trong giỏ hàng của bạn.<br />
                            Khám phá bộ sưu tập kính mắt của chúng tôi ngay!
                        </p>
                    </div>
                    <Link href="/products" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

    const itemCount = getItemCount()
    const total = getTotal()

    const handleCheckout = (): void => {
        void router.push("/cart/checkout")
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Giỏ hàng ({itemCount})</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="border rounded-lg divide-y">
                        {cart.items.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateItem}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <CartSummary
                        total={total}
                        itemCount={itemCount}
                        onCheckout={handleCheckout}
                        showCheckoutButton={true}
                    />
                </div>
            </div>
        </div>
    )
}
