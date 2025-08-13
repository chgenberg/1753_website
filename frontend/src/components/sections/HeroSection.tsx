'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, Target, TrendingUp, Star, ArrowRight, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function HeroSection() {
  const t = useTranslations()
  const [isMobile, setIsMobile] = useState(false)
  const [rating, setRating] = useState<{ avg: number; total: number } | null>(null)
  const [featuredQuotes, setFeaturedQuotes] = useState<string[]>([])
  const [modalContent, setModalContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Fetch aggregated rating from reviews stats endpoint (proxy)
    const fetchStats = async () => {
      try {
        // Use a representative product stats endpoint or a dedicated summary endpoint if available.
        const res = await fetch('/api/reviews/stats')
        if (res.ok) {
          const json = await res.json()
          const avg = json?.averageRating || json?.data?.averageRating || 4.9
          const total = json?.totalReviews || json?.data?.totalReviews || 1245
          setRating({ avg, total })
        }
      } catch {}
    }
    fetchStats()
  }, [])

  useEffect(() => {
    // Fetch a few featured reviews to display as cycling quotes
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/reviews/featured?limit=6', { next: { revalidate: 300 } })
        if (!res.ok) return
        const json = await res.json()
        const list = json?.data || json?.reviews || []
        const texts: string[] = list
          .map((r: any) => (r.title || r.body || '').toString().trim())
          .filter((s: string) => s.length > 10)
        if (texts.length >= 2) setFeaturedQuotes(texts.slice(0, 6))
      } catch {}
    }
    fetchFeatured()
  }, [])

  // Step descriptions for the modal
  const stepDescriptions = {
    'Gör hud-QUIZ': {
      title: t('home.hero.modal.step1.title'),
      description: t('home.hero.modal.step1.description')
    },
    'Få rekommendation': {
      title: t('home.hero.modal.step2.title'),
      description: t('home.hero.modal.step2.description')
    },
    'Följ upp': {
      title: t('home.hero.modal.step3.title'),
      description: t('home.hero.modal.step3.description')
    },
    'Perfekt hud!': {
      title: t('home.hero.modal.step4.title'),
      description: t('home.hero.modal.step4.description')
    }
  } as const

  const fallbackQuotes = [
    'Fantastiska produkter – min hud har aldrig mått bättre.',
    'Snabbt quiz och klockrena rekommendationer.',
    'Naturligt och skonsamt – stor skillnad på två veckor.'
  ]
  const [qIdx, setQIdx] = useState(0)
  const pauseRef = useRef(false)
  useEffect(() => {
    const id = setInterval(() => {
      const total = (featuredQuotes.length || fallbackQuotes.length)
      if (!pauseRef.current && total > 0) setQIdx(i => (i + 1) % total)
    }, 3500)
    return () => clearInterval(id)
  }, [featuredQuotes])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile 
            ? "/Cannabis/cannabis_mobile.png"
            : "/Cannabis/cannabis.png"
          }
          alt={t('home.hero.coverAlt')}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 md:from-black/40 md:via-black/30 md:to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Main Heading */}
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white drop-shadow-lg mb-6 leading-tight">
                {t('home.hero.headingLine1')}
                <span className="text-white block">{t('home.hero.headingLine2')}</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-md">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <Image 
                src="/portrait/c-and-e-2.jpg" 
                alt={t('home.hero.authorAlt')}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
                sizes="64px"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">Christopher Genberg</p>
                <p className="text-sm text-gray-600">
                  {t('home.hero.authorTagline')}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-[#FCB237] hover:bg-[#E79C1A] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t('home.hero.ctaQuiz')}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-[#FCB237] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 border-2 border-[#FCB237]"
              >
                {t('home.hero.ctaProducts')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Timeline/Process */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg" />
            
            {/* Timeline Content */}
            <div className="relative z-10 p-8 lg:p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">{t('home.hero.timelineTitle')}</h2>
              
              <div className="space-y-6">
                {[
                  { emoji: '📝', text: t('home.hero.steps.step1.title'), subtext: t('home.hero.steps.step1.badge') },
                  { emoji: '🎯', text: t('home.hero.steps.step2.title'), subtext: t('home.hero.steps.step2.badge') },
                  { emoji: '📈', text: t('home.hero.steps.step3.title'), subtext: t('home.hero.steps.step3.badge') },
                  { emoji: '✨', text: t('home.hero.steps.step4.title'), subtext: t('home.hero.steps.step4.badge') }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    onClick={() => setModalContent(stepDescriptions[(index === 0 ? 'Gör hud-QUIZ' : index === 1 ? 'Få rekommendation' : index === 2 ? 'Följ upp' : 'Perfekt hud!') as keyof typeof stepDescriptions])}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-2xl">
                      {step.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.text}</p>
                      <p className="text-sm text-gray-600">{step.subtext}</p>
                    </div>
                    {index < 3 && (
                      <div className="hidden sm:block w-8 h-0.5 bg-gradient-to-r from-[#FCB237] to-transparent" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setModalContent(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalContent.title}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-4">
              {modalContent.description.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <button
              onClick={() => setModalContent(null)}
              className="mt-6 w-full px-6 py-3 bg-[#FCB237] text-white rounded-full hover:bg-[#E79C1A] transition-colors font-medium"
            >
              {t('common.close')}
            </button>
          </motion.div>
        </div>
      )}

      {/* Trust strip just under hero */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 text-[#FCB237]">
            {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-[#FCB237] text-[#FCB237]" />)}
            <span className="text-sm text-gray-700">
              {(rating?.avg ?? 4.9).toFixed(1)}/5 • {rating?.total ?? 1245} omdömen
            </span>
          </div>
          <div
            role="region"
            aria-label="Kundcitat"
            aria-live="off"
            onMouseEnter={() => { pauseRef.current = true }}
            onMouseLeave={() => { pauseRef.current = false }}
            className="text-sm text-gray-700 italic"
          >
            “{(featuredQuotes.length ? featuredQuotes : fallbackQuotes)[qIdx] ?? ''}”
          </div>
        </div>
      </div>
    </section>
  )
} 