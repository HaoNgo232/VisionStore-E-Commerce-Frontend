import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProductsSection } from "@/components/sections/featured-products-section"
import { CategoriesSection } from "@/components/sections/categories-section"
import { BenefitsSection } from "@/components/sections/benefits-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"

export default function HomePage(): JSX.Element {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
      <CategoriesSection />
      <BenefitsSection />
      <NewsletterSection />
    </>
  )
}
