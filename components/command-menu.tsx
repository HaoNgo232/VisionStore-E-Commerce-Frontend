"use client"

import { useRouter } from "next/navigation"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Search, ShoppingBag, Home, Mail, User, ShoppingCart, Clock } from "lucide-react"
import { useProducts } from "@/features/products/hooks/use-products"
import { formatPrice } from "@/features/products/utils"
import { useCallback, useEffect, useState } from "react"

const RECENT_SEARCHES_KEY = "recent-searches"

export function CommandMenu() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const { products, loading } = useProducts({})
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse recent searches")
            }
        }
    }, [])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const addRecentSearch = useCallback((search: string) => {
        setRecentSearches((prev) => {
            const updated = [search, ...prev.filter((s) => s !== search)].slice(0, 5)
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    const runCommand = useCallback((command: () => void, searchTerm?: string) => {
        setOpen(false)
        if (searchTerm) {
            addRecentSearch(searchTerm)
        }
        command()
    }, [addRecentSearch])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Tìm kiếm sản phẩm, trang..." />
            <CommandList>
                <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

                {recentSearches.length > 0 && (
                    <>
                        <CommandGroup heading="Tìm kiếm gần đây">
                            {recentSearches.map((search, index) => (
                                <CommandItem
                                    key={index}
                                    onSelect={() => runCommand(() => router.push(`/products?search=${search}`))}
                                >
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>{search}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                <CommandGroup heading="Điều hướng">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/"))}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        <span>Trang chủ</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/products"))}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Sản phẩm</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/cart"))}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Giỏ hàng</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/contact"))}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Liên hệ</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/profile"))}
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Tài khoản</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Sản phẩm">
                    {loading && (
                        <CommandItem disabled>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Đang tải...</span>
                        </CommandItem>
                    )}
                    {!loading && products?.slice(0, 8).map((product) => {
                        const brand = product.attributes?.brand as string | undefined;
                        const price = formatPrice(product.priceInt);

                        return (
                            <CommandItem
                                key={product.id}
                                value={`${product.name} ${brand || ''}`}
                                onSelect={() => runCommand(() => router.push(`/products/${product.slug}`), product.name)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <img
                                        src={product.imageUrls?.[0] || "/placeholder.svg"}
                                        alt={product.name}
                                        className="h-8 w-8 rounded object-cover"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
                                    </div>
                                    <span className="text-sm font-semibold">{price} đ</span>
                                </div>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Danh mục">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/products?category=sunglasses"))}
                    >
                        <span>🕶️ Kính râm</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/products?category=eyeglasses"))}
                    >
                        <span>👓 Kính cận</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/products?category=sports"))}
                    >
                        <span>⚽ Kính thể thao</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/products?category=kids"))}
                    >
                        <span>👶 Kính trẻ em</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
