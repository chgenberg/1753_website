'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Sparkles, Brain, Heart, Zap } from 'lucide-react'

const heroSlides = [
  {
    imageDesktop: '/Porträtt_hemsidan/kapitel-15-desktop.png',
    imageMobile: '/Porträtt_hemsidan/kapitel-15.png',
  },
  {
    imageDesktop: '/Porträtt_hemsidan/kapitel-4-desktop.png',
    imageMobile: '/Porträtt_hemsidan/kapitel-4.png',
  },
  {
    imageDesktop: '/Porträtt_hemsidan/kapitel-43-desktop.png',
    imageMobile: '/Porträtt_hemsidan/kapitel-43.png',
  }
]

const benefits = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Livsstilsrekommendationer",
    description: "Personliga tips för sömn, stress och dagliga rutiner"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Produktrekommendationer", 
    description: "Skräddarsydda produkter för din unika hudtyp"
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Kostrekommendationer",
    description: "Näring som stödjer din hud inifrån och ut"
  }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 8000)
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
              scale: currentSlide === index ? 1 : 1.05
            }}
            transition={{ 
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 8, ease: "easeOut" }
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
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 md:pt-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full text-amber-300 text-sm font-medium tracking-wider uppercase mb-8 backdrop-blur-sm border border-amber-400/20">
              ✨ Kostnadsfritt & Personligt
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 tracking-tight leading-tight">
              <span className="block mb-2">GÖR VÅR</span>
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent font-medium mb-2">
                KOSTNADSFRIA
              </span>
              <span className="block">HUDANALYS</span>
            </h1>
          </motion.div>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 max-w-4xl mx-auto font-light leading-relaxed px-4"
          >
            Få ett komplett svar för en <span className="text-amber-300 font-medium">perfekt hud</span> på under 2 minuter
          </motion.p>

          {/* Benefits Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 max-w-6xl mx-auto px-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="text-amber-300 mb-3 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-white font-medium text-sm md:text-base lg:text-lg mb-2 leading-tight hyphens-auto" style={{ wordBreak: 'break-word' }}>
                  {benefit.title}
                </h3>
                <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4"
          >
            <Link 
              href="/quiz" 
              className="group relative inline-flex items-center justify-center px-6 md:px-10 py-4 md:py-5 text-lg md:text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-full hover:from-amber-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto min-w-[250px] sm:min-w-[280px]"
            >
              <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              <span className="relative z-10 uppercase tracking-wide text-sm md:text-base">Starta Min Hudanalys</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
            </Link>
            
            <div className="text-center">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium bg-transparent text-white border-2 border-white/40 rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300 uppercase tracking-wide"
              >
                Se Våra Produkter
              </Link>
              <p className="text-white/60 text-xs md:text-sm mt-2">Eller utforska produkter direkt</p>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/70 text-xs md:text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>100% Kostnadsfritt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Personligt AI-resultat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Tar bara 2 minuter</span>
            </div>
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
                ? 'w-12 bg-amber-400' 
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
        transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-white/80 drop-shadow-lg" />
      </motion.div>
    </section>
  )
} 