import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BlogPost } from '@/components/blog/BlogPost'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-utils'
import { generateBlogPostSEO } from '@/lib/seo-utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: {
    slug: string
    locale: string
  }
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Artikel hittades inte | 1753 Skincare',
      description: 'Den begärda artikeln kunde inte hittas.',
    }
  }
  
  const seoData = generateBlogPostSEO({
    title: post.title,
    metaDescription: post.metaDescription,
    keywords: post.keywords,
    slug: post.slug,
    author: post.author,
    date: post.date
  })
  
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.openGraph.title,
      description: seoData.openGraph.description,
      type: seoData.openGraph.type,
      url: seoData.openGraph.url,
      siteName: seoData.openGraph.siteName,
      publishedTime: post.date,
      authors: [post.author || 'Christopher Genberg'],
    },
    twitter: {
      card: seoData.twitter.card,
      title: seoData.twitter.title,
      description: seoData.twitter.description,
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <>
      <Header />
      <main className="pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogPost
            title={post.title}
            content={post.content}
            author={post.author}
            date={post.date}
            readingTime={post.readingTime}
            tags={post.tags}
            category={post.category}
          />
        </div>
      </main>
      <Footer />
    </>
  )
} 