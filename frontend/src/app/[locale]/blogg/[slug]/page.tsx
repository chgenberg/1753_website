import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BlogPost } from '@/components/blog/BlogPost'
import { generateBlogPostSEO } from '@/lib/seo-utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: {
    slug: string
    locale: string
  }
}

interface BlogPostData {
  title: string
  content: string
  date: string
  slug: string
  readingTime?: number
}

// Mock blog posts - replace with API call later
const mockPosts: BlogPostData[] = [
  {
    title: '10 tips för akne',
    content: `# 10 tips för akne

Akne är ett vanligt hudproblem som påverkar många människor. Här är våra bästa tips för att hantera akne naturligt:

## 1. Använd CBD-baserade produkter
CBD har visat sig ha anti-inflammatoriska egenskaper som kan hjälpa till att minska rodnad och svullnad.

## 2. Håll huden ren
Rengör huden varsamt två gånger dagligen med en mild rengöringsprodukt.

## 3. Undvik att peta på finnar
Detta kan leda till ärrbildning och förvärra inflammationen.

## 4. Använd icke-komedogena produkter
Välj produkter som inte täpper till porerna.

## 5. Håll håret rent
Smutsigt hår kan överföra oljor och bakterier till ansiktet.

## 6. Byt örngott regelbundet
Bakterier kan samlas på örngottet och orsaka utbrott.

## 7. Undvik att röra ansiktet
Händerna kan överföra bakterier och smuts.

## 8. Ät en balanserad kost
Undvik för mycket socker och bearbetat mat.

## 9. Hantera stress
Stress kan förvärra akne genom att öka kortisolnivåerna.

## 10. Var tålmodig
Hudförbättringar tar tid - ge det minst 6-8 veckor.`,
    date: '2024-01-15',
    slug: '10-tips-for-akne',
    readingTime: 5
  }
]

function getMockPostBySlug(slug: string): BlogPostData | null {
  return mockPosts.find(post => post.slug === slug) || null
}

export async function generateStaticParams() {
  return mockPosts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getMockPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Artikel hittades inte | 1753 Skincare',
      description: 'Den begärda artikeln kunde inte hittas.',
    }
  }

  const seoData = generateBlogPostSEO({
    title: post.title,
    metaDescription: post.content.substring(0, 160),
    slug: post.slug,
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
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getMockPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  return (
    <>
      <Header />
      <BlogPost 
        title={post.title}
        content={post.content}
        date={post.date}
        readingTime={post.readingTime}
      />
      <Footer />
    </>
  )
} 