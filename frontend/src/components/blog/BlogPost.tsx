'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, BookOpen, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface BlogPostProps {
  title: string
  content: string
  author?: string
  date?: string
  readingTime?: number
  tags?: string[]
  category?: string
  imageUrl?: string
  likes?: number
  comments?: number
}

export function BlogPost({ 
  title, 
  content, 
  author = "Christopher Genberg", 
  date,
  readingTime,
  tags = [],
  category = "Hudvård",
  imageUrl,
  likes = 0,
  comments = 0
}: BlogPostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const t = useTranslations('blog.post')

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: t('shareText', { title }),
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  // Helper function to parse bold text
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  // Function to format blog content with automatic H2 styling
  const formatBlogContent = (content: string) => {
    if (!content) return '';
    
    // Split content into lines
    const lines = content.split('\n');
    
    // Process each line
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Check if line starts with "Steg" followed by number/colon (case insensitive)
      const stepRegex = /^steg\s*\d+[\:\.]?\s*/i;
      
      if (stepRegex.test(trimmedLine)) {
        // Make it a proper H2 heading
        const cleanedTitle = trimmedLine.replace(stepRegex, (match) => {
          return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
        });
        return `## ${cleanedTitle}`;
      }
      
      return line;
    });
    
    return processedLines.join('\n');
  };

  // Parse content into paragraphs and handle special formatting
  const formatContent = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let currentParagraph: string[] = []
    
    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join(' ').trim()
        if (content) {
          elements.push(
            <p key={elements.length} className="text-gray-700 leading-relaxed mb-6 text-lg">
              {parseBoldText(content)}
            </p>
          )
        }
        currentParagraph = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip empty lines
      if (!line) {
        flushParagraph()
        continue
      }

      // Check if it's a bold heading (marked with **)
      if (line.startsWith('**') && line.endsWith('**')) {
        flushParagraph()
        const headingText = line.slice(2, -2)
        elements.push(
          <h2 key={elements.length} className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
            {headingText}
          </h2>
        )
        continue
      }

      // Check for numbered lists
      if (line.match(/^\d+\.\s/)) {
        flushParagraph()
        elements.push(
          <div key={elements.length} className="my-4 pl-6">
            <p className="text-gray-700 leading-relaxed">
              {parseBoldText(line)}
            </p>
          </div>
        )
        continue
      }

      // Check for bullet points
      if (line.match(/^[-•]\s/)) {
        flushParagraph()
        elements.push(
          <div key={elements.length} className="my-4 pl-6">
            <p className="text-gray-700 leading-relaxed">
              {parseBoldText(line)}
            </p>
          </div>
        )
        continue
      }

      // Check for sources section
      if (line.toLowerCase().includes('källor') || line.toLowerCase().includes('sources')) {
        flushParagraph()
        
        // Collect all source lines
        const sourceLines = [line]
        while (i + 1 < lines.length && lines[i + 1].trim()) {
          i++
          sourceLines.push(lines[i].trim())
        }
        
        elements.push(
          <div key={elements.length} className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('sourcesHeading')}</h3>
            <div className="space-y-2">
              {sourceLines.map((sourceLine, idx) => {
                if (sourceLine.includes('http')) {
                  // Try to split by common patterns
                  const parts = sourceLine.split(' – ')
                  if (parts.length === 2) {
                    return (
                      <a 
                        key={idx}
                        href={parts[1].trim()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-[#00937c] hover:text-[#E79C1A] transition-colors duration-300"
                      >
                        {parts[0].trim()}
                      </a>
                    )
                  }
                  return (
                    <a 
                      key={idx}
                      href={sourceLine} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-[#00937c] hover:text-[#E79C1A] transition-colors duration-300"
                    >
                      {sourceLine}
                    </a>
                  )
                }
                return <p key={idx} className="text-gray-600">{sourceLine}</p>
              })}
            </div>
          </div>
        )
        continue
      }

      // Regular text - add to current paragraph
      currentParagraph.push(line)
    }

    // Flush any remaining paragraph
    flushParagraph()

    return elements
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back to Blog */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link href="/blogg" className="inline-flex items-center text-[#00937c] hover:text-[#E79C1A] transition-colors duration-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">{t('backToBlog')}</span>
        </Link>
      </motion.div>

      {/* Hero Image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12"
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      )}

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        {/* Category Tag */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-[#00937c] text-white rounded-full text-sm font-medium">
            {category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
          {title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            <span>{author}</span>
          </div>
          {date && (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{date}</span>
            </div>
          )}
          {readingTime && (
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>{t('readingMinutes', { minutes: readingTime })}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.header>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="prose prose-lg max-w-none"
      >
        {formatContent(content)}
      </motion.div>

      {/* Engagement Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 pt-8 border-t border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{t('commentsLabel', { count: comments })}</span>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-300"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">{t('share')}</span>
          </button>
        </div>
      </motion.div>

      {/* Author Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 p-8 bg-gray-50 rounded-2xl"
      >
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-[#00937c] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {author.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{author}</h3>
            <p className="text-gray-600 mb-4">
              {t('authorBio')}
            </p>
            <Link 
              href="/om-oss" 
              className="text-[#00937c] hover:text-[#E79C1A] font-medium transition-colors duration-300"
            >
              {t('readMoreAboutUs')}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Related Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-16"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('relatedArticles')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Placeholder for related articles */}
          <div className="bg-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="font-semibold text-lg mb-2">{t('comingSoon')}</h3>
            <p className="text-gray-600 text-sm">{t('moreComing')}</p>
          </div>
        </div>
      </motion.div>
    </article>
  )
} 