import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
import BlogContent from './BlogContent'
import { getAllBlogPosts } from '@/lib/blog-utils'
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
  const posts = await Promise.resolve(getAllBlogPosts())
  
  return (
    <>
      <Header />
      <BlogContent posts={posts} />
      <Footer />
    </>
  )
} 