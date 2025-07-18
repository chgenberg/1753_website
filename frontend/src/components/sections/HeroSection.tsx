'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown } from 'lucide-react'

const heroSlides = [
  {
    imageDesktop: '/Porträtt_hemsidan/Kapitel 15-desktop.png',
    imageMobile: '/Porträtt_hemsidan/Kapitel 15.png',
  },
  {
    imageDesktop: '/Porträtt_hemsidan/Kapitel 4-desktop.png',
    imageMobile: '/Porträtt_hemsidan/Kapitel 4.png',
  },
  {
    imageDesktop: '/Porträtt_hemsidan/Kapitel 43-desktop.png',
    imageMobile: '/Porträtt_hemsidan/Kapitel 43.png',
  }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 10000) // Increased to 10 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Images with Cross-fade */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.1
            }}
            transition={{ 
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 10, ease: "easeOut" }
            }}
            className="absolute inset-0"
          >
            {/* Desktop Image */}
            <Image
              src={slide.imageDesktop}
              alt="Hero background"
              fill
              sizes="100vw"
              className="object-cover hidden md:block"
              priority={index === 0}
              quality={90}
            />
            {/* Mobile Image */}
            <Image
              src={slide.imageMobile}
              alt="Hero background"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
              priority={index === 0}
              quality={90}
            />
          </motion.div>
        ))}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Content - Quiz CTA */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight uppercase"
          >
            GÖR VÅRT KOSTNADSFRIA HUDVÅRDSQUIZ
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light"
          >
            Få en komplett hudanalys och personliga produktrekommendationer på under 2 minuter
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/quiz" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="relative z-10 uppercase tracking-wide">Starta Quiz Nu</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-transparent text-white border-2 border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 uppercase tracking-wide"
            >
              Se Produkter
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-700 ${
              index === currentSlide 
                ? 'w-12 bg-white' 
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-white drop-shadow-lg" />
      </motion.div>
    </section>
  )
} 