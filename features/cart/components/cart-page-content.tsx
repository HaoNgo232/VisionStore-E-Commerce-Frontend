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
        getTotal
    } = useCart()

    if (loading) {
        return <CartSkeleton />
    }

    if (error) {
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

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
                <p className="text-muted-foreground mt-2">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                    Bắt đầu mua sắm
                </Link>
            </div>
        )
    }

    const itemCount = getItemCount()
    const total = getTotal()

    const handleCheckout = () => {
        router.push("/cart/checkout")
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
