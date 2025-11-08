import { Truck, Shield, Headphones, RefreshCw } from "lucide-react"

const benefits = [
  {
    icon: Truck,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng trên 1.000.000đ",
  },
  {
    icon: Shield,
    title: "Thanh toán an toàn",
    description: "Giao dịch 100% bảo mật",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Dịch vụ khách hàng chuyên nghiệp",
  },
  {
    icon: RefreshCw,
    title: "Đổi trả dễ dàng",
    description: "Chính sách đổi trả 30 ngày",
  },
]

export function BenefitsSection(): JSX.Element {
  return (
    <section className="py-16 md:py-24 border-y">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
