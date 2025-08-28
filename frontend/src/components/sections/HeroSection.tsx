'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)
  const t = useTranslations('home.hero')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
      }, [])

  return (
    <>
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image - Full Screen */}
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

        {/* Use the reusable navigation component */}
        {/* HeroNavigation */}

        {/* Minimalist Text */}
        <div className="absolute inset-x-0 top-1/3 md:top-1/4 z-10 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-white text-center px-6 md:px-8 max-w-4xl"
          >
            <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase">
              {t('headingLine1')}
            </span>
            <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase mt-2">
              {t('headingLine2')}
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Cart Drawer */}
      {/* CartDrawer */}
    </>
  )
} 