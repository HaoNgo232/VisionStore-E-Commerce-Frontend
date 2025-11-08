"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { siteConfig } from "@/config/site"
import { toast } from "sonner"
import { contactFormSchema, type ContactFormValues } from "@/lib/validations/forms"

export default function ContactPage(): JSX.Element {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (_values: ContactFormValues): Promise<void> => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // console.log("[v0] Contact form submission:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Tin nhắn đã được gửi!", {
        description: "Chúng tôi sẽ phản hồi bạn sớm nhất có thể.",
      })

      setSubmitted(true)
      form.reset()

      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error("[v0] Failed to submit contact form:", error)
      toast.error("Không thể gửi tin nhắn", {
        description: "Vui lòng thử lại sau.",
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance">Liên hệ với chúng tôi</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Có câu hỏi? Chúng tôi rất muốn nghe từ bạn. Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liên hệ</CardTitle>
              <CardDescription>Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Điện thoại</p>
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Địa chỉ</p>
                  <p className="text-sm text-muted-foreground">{siteConfig.contact.address}</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Giờ làm việc</p>
                  <p className="text-sm text-muted-foreground">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                  <p className="text-sm text-muted-foreground">Thứ 7 - Chủ nhật: 10:00 - 16:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden">
                <img src="/store-location-map.jpg" alt="Vị trí cửa hàng" className="h-full w-full object-cover" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
              <CardDescription>Điền vào form bên dưới và chúng tôi sẽ phản hồi bạn sớm</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Đã gửi tin nhắn!</h3>
                  <p className="text-sm text-muted-foreground">
                    Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi bạn sớm nhất có thể.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tên của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chủ đề *</FormLabel>
                          <FormControl>
                            <Input placeholder="Chúng tôi có thể giúp gì cho bạn?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tin nhắn *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Hãy cho chúng tôi biết thêm về yêu cầu của bạn..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Câu hỏi thường gặp</CardTitle>
              <CardDescription>Câu trả lời nhanh cho các câu hỏi phổ biến</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Chính sách đổi trả của bạn là gì?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chúng tôi cung cấp chính sách đổi trả 30 ngày cho tất cả sản phẩm. Sản phẩm phải còn nguyên tình trạng ban đầu với thẻ tag còn dính.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Vận chuyển mất bao lâu?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vận chuyển tiêu chuẩn mất 3-5 ngày làm việc. Vận chuyển nhanh có sẵn với thời gian giao hàng 1-2 ngày làm việc.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Bạn có cung cấp mắt kính cận không?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Có, chúng tôi có thể lắp mắt kính cận vào hầu hết các gọng kính của chúng tôi. Liên hệ với chúng tôi để biết thêm chi tiết và giá cả.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Tôi có thể thử kính trước khi mua không?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chúng tôi cung cấp tính năng thử kính ảo trên trang sản phẩm. Bạn cũng có thể đến cửa hàng vật lý của chúng tôi để thử gọng kính trực tiếp.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
