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

export default function ContactPage() {
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

  const onSubmit = async (values: ContactFormValues) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      console.log("[v0] Contact form submission:", values)

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
        <h1 className="text-3xl font-bold tracking-tight text-balance">Contact Us</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Our team is here to help you</CardDescription>
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
                  <p className="font-medium">Phone</p>
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
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{siteConfig.contact.address}</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden">
                <img src="/store-location-map.jpg" alt="Store location" className="h-full w-full object-cover" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you shortly</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
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
                              <Input type="email" placeholder="your@email.com" {...field} />
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
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
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
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us more about your inquiry..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What is your return policy?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We offer a 30-day return policy for all products. Items must be in original condition with tags
                  attached.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">How long does shipping take?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days
                  delivery.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Do you offer prescription lenses?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes, we can add prescription lenses to most of our frames. Contact us for more details and pricing.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Can I try glasses before buying?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We offer a virtual try-on feature on our product pages. You can also visit our physical store to try
                  frames in person.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
