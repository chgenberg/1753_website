'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

export function HeroSection() {
  const t = useTranslations()
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const menuItems = [
    { href: '/products', label: t('navigation.products') },
    { href: '/quiz', label: t('navigation.quiz') },
    { href: '/om-oss', label: t('navigation.about') },
    { href: '/kunskap', label: t('navigation.knowledge') },
    { href: '/kontakt', label: t('navigation.contact') },
  ]

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile 
            ? "/background/swin_backgrund_mobile.png"
            : "/background/swin_backgrund.png"
          }
          alt="Minimalist background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Minimalist Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 md:p-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="block">
            <Image
              src="/1753_white.png"
              alt="1753 Skincare"
              width={120}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Hamburger Menu */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:opacity-80 transition-opacity relative z-50"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
            ) : (
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 flex items-center justify-center"
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-3xl md:text-4xl text-white font-light py-4 hover:opacity-70 transition-opacity"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-2xl"
        >
          {/* Main Text */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight">
            {t('home.hero.headingLine1')}
            <span className="block mt-2">{t('home.hero.headingLine2')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 font-light max-w-lg">
            {t('home.hero.subtitle')}
          </p>

          {/* Minimalist CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/quiz"
              className="inline-block px-8 py-3 text-white border border-white hover:bg-white hover:text-black transition-all duration-300 text-center"
            >
              {t('home.hero.ctaQuiz')}
            </Link>
            <Link
              href="/products"
              className="inline-block px-8 py-3 text-white/90 hover:text-white transition-all duration-300 text-center"
            >
              {t('home.hero.ctaProducts')} →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 