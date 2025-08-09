'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import NewsletterSection from '@/components/sections/NewsletterSection'
import { BlogPost } from '@/types'

// Extend BlogPost type to include image fields
interface BlogPostWithImages extends BlogPost {
  image?: string
}

interface BlogContentProps {
  posts: BlogPostWithImages[]
}

export default function BlogContent({ posts }: BlogContentProps) {
  // Handle case where posts might be undefined or null
  const safePosts = posts || [];
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Available blog images in portrait format
  const portraitImages = [
    'Kapitel 1.png', 'Kapitel 2.png', 'Kapitel 3.png', 'Kapitel 4.png', 'Kapitel 5.png',
    'Kapitel 6.png', 'Kapitel 7.png', 'Kapitel 8.png', 'Kapitel 9.png', 'Kapitel 10.png',
    'Kapitel 11.png', 'Kapitel 12.png', 'Kapitel 13.png', 'Kapitel 14.png', 'Kapitel 15.png',
    'Kapitel 16.png', 'Kapitel 17.png', 'Kapitel 18.png', 'Kapitel 19.png', 'Kapitel 20.png',
    'Kapitel 21.png', 'Kapitel 22.png', 'Kapitel 23.png', 'Kapitel 24.png', 'Kapitel 25.png',
    'Kapitel 26.png', 'Kapitel 27.png', 'Kapitel 28.png', 'Kapitel 29.png', 'Kapitel 30.png',
    'Kapitel 31.png', 'Kapitel 32.png', 'Kapitel 33.png', 'Kapitel 34.png', 'Kapitel 35.png',
    'Kapitel 36.png', 'Kapitel 37.png', 'Kapitel 38.png', 'Kapitel 39.png', 'Kapitel 40.png',
    'Kapitel 41.png', 'Kapitel 42.png', 'Kapitel 43.png', 'Kapitel 44.png', 'Kapitel 45.png',
    'Kapitel 46.png', 'Kapitel 47.png', 'Kapitel 48.png', 'Kapitel 49.png', 'Kapitel 50.png',
    'Kapitel 51.png', 'Kapitel 52.png', 'Kapitel 53.png', 'Kapitel 54.png', 'Kapitel 55.png',
    'Kapitel 56.png', 'Kapitel 57.png', 'Kapitel 58.png', 'Kapitel 59.png', 'Kapitel 60.png',
    'Kapitel 61.png', 'Kapitel 62.png', 'Kapitel 63.png', 'Kapitel 64.png'
  ]

  // Hash helper to distribute images per slug
  const slugHash = (slug: string) => {
    let h = 0
    for (let i = 0; i < slug.length; i++) {
      h = (h * 31 + slug.charCodeAt(i)) >>> 0
    }
    return h
  }

  // Extract unique categories and tags
  const categories = useMemo(() => {
    const cats = new Set(safePosts.map(post => post.category || 'Hudvård'))
    return Array.from(cats).sort()
  }, [safePosts])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    safePosts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [safePosts])

  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    return safePosts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || post.category === selectedCategory
      
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag)
      
      return matchesSearch && matchesCategory && matchesTag
    })
  }, [safePosts, searchQuery, selectedCategory, selectedTag])

  // Assign images sequentially from Kapitel 1..64 based on visible index to avoid near-duplicates
  const assignedImages = useMemo(() => {
    // Use a stride to spread images better across the grid
    const N = portraitImages.length
    const stride = 5 // relatively prime w.r.t common column counts (3,4)
    return filteredPosts.map((post, index) => {
      const explicit = (post as BlogPostWithImages).image
      if (explicit) return explicit
      const imgIdx = (index * stride) % N
      return `/Bilder_kvinnor%20boken_2025/${portraitImages[imgIdx]}`
    })
  }, [filteredPosts])

  // Function to get fallback image for a post when no explicit image found
  const getFallbackImage = (slug: string, index: number) => {
    const N = portraitImages.length
    const stride = 5
    const imageIndex = (index * stride) % N
    return `/Bilder_kvinnor%20boken_2025/${portraitImages[imageIndex]}`
  }

  return (
    <main className="pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#F5F3F0] to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Blogg
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Utforska världen av cannabinoid-hudvård, lär dig om hudens endocannabinoidsystem 
              och få insikter om hur du kan revolutionera din hudvård.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök bland våra artiklar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-[#00937c] transition-colors duration-300"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Category Filter */}
            <div>
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium text-gray-700">Kategorier:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    !selectedCategory 
                      ? 'bg-[#00937c] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Alla
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      selectedCategory === category 
                        ? 'bg-[#00937c] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <div className="flex items-center mb-3">
                <Tag className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium text-gray-700">Taggar:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    !selectedTag 
                      ? 'bg-[#00937c] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Alla
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                      selectedTag === tag 
                        ? 'bg-[#00937c] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 text-gray-600">
            Visar {filteredPosts.length} av {safePosts.length} artiklar
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {safePosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-2xl font-bold">1753</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Inga artiklar än</h3>
                <p className="text-gray-600 mb-8">
                  Vi arbetar på att skapa fantastiskt innehåll för dig. Kom tillbaka snart!
                </p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2A1E] transition-colors"
                >
                  Utforska våra produkter istället
                </Link>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">Inga artiklar hittades. Prova att ändra dina filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post, index) => (
                <Link key={post.slug} href={`/blogg/${post.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col max-w-sm mx-auto"
                  >
                    <div className="relative aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={assignedImages[index]}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={index < 8}
                        />
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-[#00937c] bg-opacity-10 text-[#00937c] rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold mb-3 group-hover:text-[#00937c] transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                        {(() => {
                          // Clean HTML content much more thoroughly
                          let cleanText = post.content
                            // First remove all HTML tags completely
                            .replace(/<[^>]*>/g, '')
                            // Remove any remaining attribute patterns like class="..." or style="..."
                            .replace(/\w+\s*=\s*["'][^"']*["']/gi, '')
                            // Remove Tailwind/CSS class names that might be left over
                            .replace(/(?:mb|mt|pt|pb|px|py|pl|pr|ml|mr|text|bg|border|rounded|flex|grid|w|h|max|min|lg|md|sm|xl|2xl|leading|font|italic|bold|semibold|tracking|space|gap|justify|items|align|transform|transition|duration|ease|hover|focus|active|group|relative|absolute|fixed|sticky|top|bottom|left|right|z|opacity|scale|rotate|translate|cursor|pointer|select|resize|overflow|hidden|visible|scroll|auto|block|inline|table|sr)-[\w-]*[\w]/g, '')
                            // Remove standalone CSS class words
                            .replace(/\b(?:italic|bold|semibold|flex|grid|block|inline|hidden|visible|relative|absolute|fixed|sticky|pointer|auto|scroll|left|right|center|top|bottom|start|end|between|around|evenly|stretch|baseline|nowrap|wrap|reverse|col|row|gap|space|justify|items|align|content|self|order|shrink|grow|basis)\b/g, '')
                            // Remove quotes and special characters that might be left
                            .replace(/["'`><]/g, '')
                            // Remove any remaining class/style attribute fragments
                            .replace(/class\s*[:=]\s*|style\s*[:=]\s*/gi, '')
                            // Clean up multiple spaces and line breaks
                            .replace(/\s+/g, ' ')
                            // Remove leading/trailing spaces and special characters
                            .replace(/^[\s\-=>]+|[\s\-=>]+$/g, '')
                            .trim();
                          
                          // If text is empty or too short, try to get first meaningful sentence
                          if (cleanText.length < 10) {
                            // Try to extract first sentence from content
                            const textOnly = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                            const firstSentence = textOnly.split('.')[0];
                            if (firstSentence && firstSentence.length > 10) {
                              cleanText = firstSentence + '.';
                            } else {
                              cleanText = textOnly.substring(0, 150);
                            }
                          }
                          
                          // Truncate if still too long
                          if (cleanText.length > 150) {
                            cleanText = cleanText.substring(0, 150);
                            // Try to end at a word boundary
                            const lastSpace = cleanText.lastIndexOf(' ');
                            if (lastSpace > 100) {
                              cleanText = cleanText.substring(0, lastSpace);
                            }
                          }
                          
                          return cleanText + (cleanText.length < post.content.replace(/<[^>]*>/g, '').length ? '...' : '');
                        })()}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div className="flex items-center space-x-4">
                          {post.publishedAt && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(post.publishedAt).toLocaleDateString('sv-SE')}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{Math.ceil(post.content.length / 1000)} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Missa inga nyheter</h2>
            <p className="text-xl text-gray-600 mb-8">
              Prenumerera på vårt nyhetsbrev och få de senaste artiklarna direkt till din inbox.
            </p>
            <NewsletterSection variant="minimal" />
          </motion.div>
        </div>
      </section>
    </main>
  )
} 