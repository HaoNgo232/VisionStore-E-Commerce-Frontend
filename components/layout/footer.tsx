import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { siteConfig } from "@/config/site"
import type { JSX } from "react"

const footerLinks = {
  shop: [
    { name: "Tất cả sản phẩm", href: "/products" },
    { name: "Kính râm", href: "/products?category=sunglasses" },
    { name: "Kính cận", href: "/products?category=eyeglasses" },
    { name: "Thể thao", href: "/products?category=sports" },
  ],
  support: [
    { name: "Liên hệ", href: "/contact" },
    { name: "Thông tin vận chuyển", href: "/shipping" },
    { name: "Đổi trả", href: "/returns" },
    { name: "Câu hỏi thường gặp", href: "/faq" },
  ],
  company: [
    { name: "Về chúng tôi", href: "/about" },
    { name: "Tuyển dụng", href: "/careers" },
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Điều khoản dịch vụ", href: "/terms" },
  ],
}

export function Footer(): JSX.Element {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-semibold">VisionStore</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{siteConfig.description}</p>
            <div className="flex gap-4">
              <Link
                href={siteConfig.links.facebook}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href={siteConfig.links.instagram}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href={siteConfig.links.twitter}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Cửa hàng</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Công ty</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name}. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/home" className="hover:text-foreground">
                Bảo mật
              </Link>
              <Link href="/home" className="hover:text-foreground">
                Điều khoản
              </Link>
              <Link href="/home" className="hover:text-foreground">
                Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
