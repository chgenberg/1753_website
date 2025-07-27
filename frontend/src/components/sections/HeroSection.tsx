'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, Target, TrendingUp, Star, ArrowRight, X } from 'lucide-react'

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)
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

  // Step descriptions for the modal
  const stepDescriptions = {
    'Gör hud-QUIZ': {
      title: '📝 Gör hud-QUIZ',
      description: 'Vårt hudvårdsquiz tar bara 2 minuter och hjälper oss förstå din unika hudtyp och dina specifika behov.\n\nGenom att svara på några enkla frågor om din hud, livsstil och preferenser kan vi skapa en skräddarsydd hudvårdsrutin just för dig.\n\nQuizet analyserar faktorer som hudtyp, eventuella hudproblem, ålder och miljöpåverkan för att ge dig de mest relevanta produktrekommendationerna.'
    },
    'Få rekommendation': {
      title: '🎯 Få rekommendation',
      description: 'Baserat på dina quiz-svar får du en personlig hudvårdsplan med produktrekommendationer som är specifikt utvalda för din hudtyp och dina behov.\n\nVår algoritm kombinerar traditionell hudvårdskunskap med modern vetenskap för att skapa en komplett rutin som inkluderar rengöring, behandling och skydd.\n\nDu får också tips om hur du bäst använder produkterna för optimala resultat.'
    },
    'Följ upp': {
      title: '📈 Följ upp',
      description: 'Vi följer din hudvårdsresa varje vecka för att säkerställa att du ser kontinuerliga förbättringar.\n\nGenom regelbundna check-ins kan vi justera din rutin vid behov och ge dig personliga tips baserat på hur din hud utvecklas.\n\nDu får påminnelser om när det är dags att applicera produkterna och kan dokumentera din progress med bilder för att tydligt se förbättringarna över tid.'
    },
    'Perfekt hud!': {
      title: '✨ Perfekt hud!',
      description: 'Inom 3 månader kommer du att se en märkbar förbättring av din huds kvalitet och utseende.\n\nMed våra naturliga produkter innehållande CBD och CBG, kombinerat med din personliga hudvårdsrutin, kommer din hud att bli mer balanserad, klarare och strålande.\n\nMånga av våra kunder rapporterar synliga resultat redan efter några veckor, men den fulla effekten uppnås vanligtvis inom 3 månader av konsekvent användning.'
    }
  };

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
                  Grundare • 12+ års erfarenhet • Hudvårdsrebell
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
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => setModalContent(stepDescriptions[step.text as keyof typeof stepDescriptions])}
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
              className="mt-6 w-full px-6 py-3 bg-[#4A3428] text-white rounded-full hover:bg-[#3A2A1E] transition-colors font-medium"
            >
              Stäng
            </button>
          </motion.div>
        </div>
      )}
    </section>
  )
} 