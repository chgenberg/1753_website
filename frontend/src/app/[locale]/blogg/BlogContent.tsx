'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import NewsletterSection from '@/components/sections/NewsletterSection'

interface BlogPost {
  title: string
  content: string
  date?: string
  author?: string
  slug: string
  url?: string
  tags?: string[]
  category?: string
  readingTime?: number
  metaDescription?: string
  keywords?: string[]
}

interface BlogContentProps {
  posts: BlogPost[]
}

export default function BlogContent({ posts }: BlogContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract unique categories and tags
  const categories = useMemo(() => {
    const cats = new Set(posts.map(post => post.category || 'Hudvård'))
    return Array.from(cats).sort()
  }, [posts])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || post.category === selectedCategory
      
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag)
      
      return matchesSearch && matchesCategory && matchesTag
    })
  }, [posts, searchQuery, selectedCategory, selectedTag])

  return (
    <main className="pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 to-blue-50">
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
            Visar {filteredPosts.length} av {posts.length} artiklar
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">Inga artiklar hittades. Prova att ändra dina filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <Link key={post.slug} href={`/blogg/${post.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {/* Gradient placeholder with category-based colors */}
                      <div className={`w-full h-48 flex items-center justify-center ${
                        post.category === 'Cannabinoider' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                        post.category === 'Endocannabinoidsystem' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        post.category === 'Medicinska Svampar' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        post.category === 'Hudproblem' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                        post.category === 'Mikrobiom' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                        'bg-gradient-to-br from-[#00937c] to-[#00b89d]'
                      }`}>
                        <span className="text-white text-4xl font-bold opacity-50">1753</span>
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
                        {post.content.substring(0, 150)}...
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
                          {post.date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{post.date}</span>
                            </div>
                          )}
                          {post.readingTime && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{post.readingTime} min</span>
                            </div>
                          )}
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