'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

// Blog post type definition
interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime?: string
}

// Mock blog data - replace with API call later
const mockBlogPosts: BlogPost[] = [
  {
    slug: '10-tips-for-akne',
    title: '10 tips för akne',
    excerpt: 'Upptäck de bästa metoderna för att hantera akne naturligt med CBD och CBG. Lär dig hur cannabinoider kan hjälpa din hud...',
    date: '2024-01-15',
    readingTime: '5 min'
  },
  {
    slug: 'cbd-och-cbg-cellfornyelse',
    title: 'CBD och CBG - Cellförnyelseprocessen',
    excerpt: 'Förstå hur CBD och CBG påverkar hudens naturliga cellförnyelse och kan hjälpa till att återställa hudens balans...',
    date: '2024-01-12',
    readingTime: '7 min'
  },
  {
    slug: 'endocannabinoidsystemet-i-huden',
    title: 'Endocannabinoidsystemet i huden',
    excerpt: 'En djupgående guide till hur endocannabinoidsystemet fungerar i huden och varför det är så viktigt för hudhälsa...',
    date: '2024-01-10',
    readingTime: '6 min'
  }
]

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100))
        setPosts(mockBlogPosts)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Images for blog posts with responsive versions
  const blogImages = [
    { desktop: '/Porträtt_hemsidan/Kapitel 22-desktop.png', mobile: '/Porträtt_hemsidan/Kapitel 22.png' },
    { desktop: '/Porträtt_hemsidan/Kapitel 24-desktop.png', mobile: '/Porträtt_hemsidan/Kapitel 24.png' },
    { desktop: '/Porträtt_hemsidan/Kapitel 37-desktop.png', mobile: '/Porträtt_hemsidan/Kapitel 37.png' }
  ]

  if (loading) {
    return (
      <section className="py-24 bg-[var(--color-bg-primary)]">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[var(--color-bg-primary)]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-primary-dark)] mb-4 tracking-tight">
            SENASTE FRÅN BLOGGEN
          </h2>
          <p className="text-lg text-[var(--color-gray-600)] max-w-2xl mx-auto font-light">
            Utforska tips, guider och nyheter om naturlig hudvård
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blogg/${post.slug}`} className="block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    {/* Desktop Image */}
                    <Image
                      src={blogImages[index]?.desktop || blogImages[0].desktop}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 hidden md:block"
                    />
                    {/* Mobile Image */}
                    <Image
                      src={blogImages[index]?.mobile || blogImages[0].mobile}
                      alt={post.title}
                      fill
                      sizes="100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 md:hidden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-[var(--color-gray-500)] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime || '5 min läsning'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-3 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[var(--color-gray-600)] line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <span className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium group-hover:gap-3 transition-all">
                      Läs mer
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* View all posts */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/blogg"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-4 rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors group"
          >
            Visa alla artiklar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 