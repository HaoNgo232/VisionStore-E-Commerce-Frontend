import type React from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartProvider } from "@/features/cart/context/cart-context"
import { CommandMenu } from "@/components/command-menu"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <CommandMenu />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  )
}
