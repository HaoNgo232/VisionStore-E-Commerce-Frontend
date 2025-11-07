"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, User, LogOut, Settings, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/stores/cart.store"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { authService } from "@/features/auth/services/auth.service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Contact", href: "/contact" },
]

const categories = [
  { name: "Eyeglasses", href: "/products?category=eyeglasses", description: "Prescription and fashion eyewear" },
  { name: "Sunglasses", href: "/products?category=sunglasses", description: "UV protection and style" },
  { name: "Sports", href: "/products?category=sports", description: "Performance eyewear" },
  { name: "Kids", href: "/products?category=kids", description: "Durable eyewear for children" },
]

export function Header() {
  const { accessToken, logout } = useAuth()
  const router = useRouter()
  const itemCount = useCartStore((state) => state.getItemCount())

  const handleLogout = async () => {
    try {
      await authService.logout()
      logout()
      router.push("/home")
      toast.success("Đã đăng xuất")
    } catch {
      toast.error("Lỗi khi đăng xuất")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">V</span>
          </div>
          <span className="text-xl font-semibold">VisionStore</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/products" className={navigationMenuTriggerStyle()}>
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/contact" className={navigationMenuTriggerStyle()}>
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <Button
            variant="outline"
            className="hidden md:inline-flex relative w-[200px] lg:w-[300px] justify-start text-sm text-muted-foreground"
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              })
              document.dispatchEvent(event)
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search products...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* User Account Dropdown */}
          {accessToken ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile#orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    Đơn hàng
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile#settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  suppressHydrationWarning
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <ScrollArea className="h-full py-6">
                <div className="flex flex-col gap-6">
                  {/* Search */}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm text-muted-foreground"
                    onClick={() => {
                      const event = new KeyboardEvent("keydown", {
                        key: "k",
                        metaKey: true,
                        bubbles: true,
                      })
                      document.dispatchEvent(event)
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search products...</span>
                  </Button>

                  {/* Main Navigation */}
                  <nav className="flex flex-col gap-1">
                    <h3 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Menu</h3>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Categories */}
                  <div className="flex flex-col gap-1">
                    <h3 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Categories</h3>
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="rounded-md px-3 py-2"
                      >
                        <div className="text-base font-medium">{category.name}</div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </Link>
                    ))}
                  </div>

                  {/* Account */}
                  <div className="flex flex-col gap-1 border-t pt-4">
                    <h3 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Account</h3>
                    <Link
                      href="/profile"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/profile#orders"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                    <Link
                      href="/profile#settings"
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button className="flex items-center rounded-md px-3 py-2 text-base font-medium text-destructive transition-colors hover:bg-accent">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
