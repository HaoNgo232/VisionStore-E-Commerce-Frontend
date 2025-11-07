import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Glasses, Sun, Zap, Baby } from "lucide-react"

const categories = [
  {
    name: "Eyeglasses",
    href: "/products?category=eyeglasses",
    icon: Glasses,
    description: "Classic frames for everyday wear",
    image: "/category-eyeglasses.jpg",
  },
  {
    name: "Sunglasses",
    href: "/products?category=sunglasses",
    icon: Sun,
    description: "UV protection with style",
    image: "/category-sunglasses.jpg",
  },
  {
    name: "Sports",
    href: "/products?category=sports",
    icon: Zap,
    description: "Performance eyewear for athletes",
    image: "/category-sports.jpg",
  },
  {
    name: "Kids",
    href: "/products?category=kids",
    icon: Baby,
    description: "Durable frames for children",
    image: "/category-kids.jpg",
  },
]

export function CategoriesSection(): JSX.Element {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">Shop by Category</h2>
          <p className="mt-4 text-muted-foreground text-pretty">Find the perfect eyewear for your lifestyle</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.name} href={category.href}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <Icon className="h-8 w-8 mb-2" />
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
