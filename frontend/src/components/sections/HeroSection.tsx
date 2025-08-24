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
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      {/* Minimalist Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 md:p-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="block">
            <Image
              src="/1753_white.png"
              alt="1753 Skincare"
              width={200}
              height={80}
              className="h-16 md:h-24 w-auto"
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

      {/* Slide-in Menu from Right */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 md:w-96 bg-black/90 backdrop-blur-md z-50 p-8 md:p-12"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 md:top-8 md:right-8 p-2 hover:opacity-80 transition-opacity"
              >
                <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </button>

              {/* Menu items */}
              <nav className="mt-20">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-2xl md:text-3xl text-white font-light py-4 hover:opacity-70 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
} 