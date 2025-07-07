'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Target, Zap, Microscope } from 'lucide-react'
import { SkinCareQuizModal } from '@/components/quiz/SkinCareQuizModal'

export const HeroSection = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const openQuiz = () => setIsQuizOpen(true)
  const closeQuiz = () => setIsQuizOpen(false)

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-[#F3EFE3] to-[#E8E3D3] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#014421]"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-[#93C560]"></div>
          <div className="absolute bottom-40 left-20 w-28 h-28 rounded-full bg-[#660C21]"></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 rounded-full bg-[#FFE135]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Main Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#014421] mb-6 leading-tight">
                UPPTÄCK DIN PERFEKTA
                <span className="block text-[#93C560]">HUDVÅRDSSTRATEGI</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#112A12] mb-8 max-w-3xl mx-auto leading-relaxed">
                Få personaliserade rekommendationer för optimal hudhälsa baserat på din hudtyp, 
                livsstil och behov. Vårt intelligenta quiz analyserar din hudkondition och ger 
                dig skräddarsydda råd för en strålande hud.
              </p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10"
              >
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md">
                  <div className="w-10 h-10 bg-[#93C560] rounded-full flex items-center justify-center text-xl">
                    🎯
                  </div>
                  <span className="text-[#014421] font-medium">Personaliserade hudrekommendationer</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md">
                  <div className="w-10 h-10 bg-[#93C560] rounded-full flex items-center justify-center text-xl">
                    🧬
                  </div>
                  <span className="text-[#014421] font-medium">Vetenskapligt baserade hudråd</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md">
                  <div className="w-10 h-10 bg-[#93C560] rounded-full flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <span className="text-[#014421] font-medium">Snabb analys på 3 minuter</span>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-6"
              >
                <button
                  onClick={openQuiz}
                  className="group bg-[#014421] hover:bg-[#112A12] text-white px-8 py-4 md:px-12 md:py-6 rounded-full text-lg md:text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  Starta Ditt Personliga Hudquiz
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-[#112A12]/70 text-sm md:text-base"
              >
                12 smarta frågor • Kostnadsfritt • Inga mejl krävs
              </motion.p>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-20"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-12">
                Vad får du ut av quizet?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-[#93C560] rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                    🧴
                  </div>
                  <h3 className="text-xl font-bold text-[#014421] mb-4">Hudvårdsrutin</h3>
                  <p className="text-[#112A12] leading-relaxed">
                    Personaliserad morgon- och kvällsrutin anpassad för din hudtyp
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-[#93C560] rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                    🏃‍♀️
                  </div>
                  <h3 className="text-xl font-bold text-[#014421] mb-4">Livsstilstips</h3>
                  <p className="text-[#112A12] leading-relaxed">
                    Praktiska råd för sömn, stress och vanor som förbättrar hudhälsan
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-[#93C560] rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                    🥗
                  </div>
                  <h3 className="text-xl font-bold text-[#014421] mb-4">Kost & Tillskott</h3>
                  <p className="text-[#112A12] leading-relaxed">
                    Näringsrekommendationer och tillskott för hudhälsa inifrån
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#014421] text-sm">Utforska våra produkter</span>
            <div className="w-6 h-10 border-2 border-[#014421] rounded-full flex justify-center">
              <div className="w-1 h-3 bg-[#014421] rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quiz Modal */}
      {isQuizOpen && (
        <SkinCareQuizModal 
          onClose={closeQuiz}
        />
      )}
    </>
  )
} 