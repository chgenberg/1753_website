import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
import BlogContent from './BlogContent'
import { generatePageSEO } from '@/lib/seo-utils'

const seoData = generatePageSEO('blog')

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

export default async function BlogPage() {
  // Mock blog posts - replace with API call later
  const mockPosts = [
    {
      title: '10 tips för akne',
      content: 'Upptäck de bästa metoderna för att hantera akne naturligt med CBD och CBG...',
      date: '2024-01-15',
      slug: '10-tips-for-akne',
      readingTime: 5
    },
    {
      title: 'CBD och CBG - Cellförnyelseprocessen',
      content: 'Förstå hur CBD och CBG påverkar hudens naturliga cellförnyelse...',
      date: '2024-01-12',
      slug: 'cbd-och-cbg-cellfornyelse',
      readingTime: 7
    }
  ]
  
  return (
    <>
      <Header />
      <BlogContent posts={mockPosts} />
      <Footer />
    </>
  )
} 