'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, Target, TrendingUp, Star } from 'lucide-react'

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

  const timelineSteps = [
    { icon: '📝', text: 'Gör hud-QUIZ', delay: 0.2 },
    { icon: '🎯', text: 'Få rekommendation', delay: 0.4 },
    { icon: '📊', text: 'Följ upp', delay: 0.6 },
    { icon: '✨', text: 'Perfekt hud!', delay: 0.8 }
  ]

  const features = [
    { 
      icon: '🔬', 
      title: 'Vetenskapligt baserat',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      icon: '🎯', 
      title: 'Bättre fokus',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      icon: '💡', 
      title: 'Stärkt immunförsvar',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: '😊', 
      title: 'Förbättrat humör',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: '💪', 
      title: 'Bättre sömn',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Snabbläs artiklar</span>
            </motion.div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                UPPTÄCK KRAFTEN I
                <span className="block text-[#8B6B47] drop-shadow-lg">
                  PERSONLIG HUDVÅRD
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200">
                Mat som medicin för kropp och själ
              </p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/quiz"
                className="group inline-flex items-center justify-center gap-2 bg-[#4A3428] hover:bg-[#3A2A1E] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                Starta Hudquiz
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg transition-all"
              >
                📦 Våra produkter
              </Link>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <h3 className="text-lg font-semibold mb-6 text-gray-200">Din resa mot perfekt hud:</h3>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.delay }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.text}</p>
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features Grid (Hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="hidden md:grid grid-cols-3 gap-4 mt-12"
            >
              {features.slice(0, 3).map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <p className="text-sm">{feature.title}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Expert Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Video Placeholder */}
              <div className="relative aspect-video bg-gray-100">
                {isMobile ? (
                  <iframe
                    src="https://player.vimeo.com/video/1067718781?h=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="absolute inset-0 w-full h-full"
                    title="1753 Skincare Quiz - Mobile"
                  />
                ) : (
                  <iframe
                    src="https://player.vimeo.com/video/1067692676?h=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="absolute inset-0 w-full h-full"
                    title="1753 Skincare Quiz - Desktop"
                  />
                )}
              </div>

              {/* Expert Info */}
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    CG
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Christopher Genberg</h3>
                    <p className="text-gray-600">1753 Skincare Expert</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600">25+ års erfarenhet</span>
                </div>
              </div>
            </div>

            {/* Floating Features (Mobile) */}
            <div className="md:hidden grid grid-cols-2 gap-3 mt-6">
              {features.slice(0, 4).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
                >
                  <div className="text-2xl mb-1">{feature.icon}</div>
                  <p className="text-xs text-gray-700">{feature.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 