import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { SafeProductsSection } from '@/components/sections/SafeProductsSection'
import { SafeReviewsCarousel } from '@/components/sections/SafeReviewsCarousel'
import { AboutSection } from '@/components/sections/AboutSection'
import { BlogSection } from '@/components/sections/BlogSection'
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

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <SafeProductsSection />
        <SafeReviewsCarousel />
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