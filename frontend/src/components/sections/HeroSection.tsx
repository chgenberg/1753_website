'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, Target, TrendingUp, Star, ArrowRight } from 'lucide-react'

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
        <img
          src={isMobile 
            ? "/Porträtt_hemsidan/Omslag_2025_mobile.png"
            : "/Porträtt_hemsidan/Omslag_2025_desktop.png"
          }
          alt="1753 Skincare Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
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
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Naturlig hudvård för
                <span className="text-[#4A3428] block">hudens ekosystem</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                Vetenskapligt utvecklad hudvård som arbetar i harmoni med hudens celler, mikrobiom och endocannabinoidsystem
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <img 
                src="/Porträtt/Christopher2.jpg" 
                alt="Christopher Genberg"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">Christopher Genberg</p>
                <p className="text-sm text-gray-600">
                  Grundare • 12+ års erfarenhet • Functional Medicine
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-[#4A3428] hover:bg-[#3A2A1E] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Gör hud-QUIZ
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-[#4A3428] bg-white hover:bg-gray-50 rounded-full transition-all duration-300 border-2 border-[#4A3428]"
              >
                Se produkter
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B6B47]/10 to-transparent rounded-3xl" />
            
            {/* Timeline Content */}
            <div className="relative z-10 p-8 lg:p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">Din resa till perfekt hud</h2>
              
              <div className="space-y-6">
                {[
                  { emoji: '📝', text: 'Gör hud-QUIZ', subtext: '2 minuter' },
                  { emoji: '🎯', text: 'Få rekommendation', subtext: 'Personlig plan' },
                  { emoji: '📈', text: 'Följ upp', subtext: 'Veckovis förbättring' },
                  { emoji: '✨', text: 'Perfekt hud!', subtext: 'Inom 3 månader' }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-2xl">
                      {step.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.text}</p>
                      <p className="text-sm text-gray-600">{step.subtext}</p>
                    </div>
                    {index < 3 && (
                      <div className="hidden sm:block w-8 h-0.5 bg-gradient-to-r from-[#8B6B47] to-transparent" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 