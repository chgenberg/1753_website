'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

      {/* White Logo on Hero */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 md:p-8">
        <Image
          src="/1753_white.png"
          alt="1753 Skincare"
          width={200}
          height={80}
          className="h-16 md:h-24 w-auto"
          priority
        />
      </div>

      {/* Minimalist Text */}
      <div className="absolute inset-x-0 top-1/3 md:top-1/4 z-10 flex items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white text-center px-6 md:px-8 max-w-4xl"
        >
          <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase">
            Hudvårdsindustrin har sin sanning.
          </span>
          <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase mt-2">
            Vi har en annan.
          </span>
        </motion.h1>
      </div>
    </section>
  )
} 