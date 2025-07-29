import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
// import { ProductsSection } from '@/components/sections/ProductsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { BlogSection } from '@/components/sections/BlogSection'
import { ReviewsSection } from '@/components/sections/ReviewsSection'
import { GallerySection } from '@/components/sections/GallerySection'
import NewsletterSection from '@/components/sections/NewsletterSection'
import { EbookSection } from '@/components/sections/EbookSection'
import { generatePageSEO } from '@/lib/seo-utils'
import type { Metadata } from 'next'

const seoData = generatePageSEO('home')

export const metadata: Metadata = {
  title: seoData.title,
  description: seoData.description,
  keywords: seoData.keywords,
  openGraph: {
    title: seoData.openGraph.title,
    description: seoData.openGraph.description,
    type: seoData.openGraph.type,
    url: seoData.openGraph.url,
    siteName: seoData.openGraph.siteName,
  },
  twitter: {
    card: seoData.twitter.card,
    title: seoData.twitter.title,
    description: seoData.twitter.description,
  },
}

// Temporary simple products section to prevent React error
function TemporaryProductsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Våra <span className="text-[#8B6B47]">produkter</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Naturlig hudvård baserad på CBD och funktionella svampar
          </p>
        </div>
        <div className="text-center">
          <a 
            href="/products" 
            className="inline-flex items-center gap-2 bg-[#4A3428] hover:bg-[#3A2A1E] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Se alla produkter
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TemporaryProductsSection />
        <ReviewsSection />
        <EbookSection />
        <AboutSection />
        <GallerySection />
        <BlogSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  )
} 