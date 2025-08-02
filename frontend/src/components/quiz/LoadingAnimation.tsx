'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Leaf, Heart, Package, Star, Zap, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoadingAnimationProps {
  progress: number
}

interface LoadingPhase {
  icon: React.ReactNode
  title: string
  message: string
  startProgress: number
  endProgress: number
}

const loadingPhases: LoadingPhase[] = [
  {
    icon: <Brain className="w-12 h-12 text-white" />,
    title: "Analyserar dina svar",
    message: "Vår AI går igenom din unika hudprofil...",
    startProgress: 0,
    endProgress: 15
  },
  {
    icon: <Leaf className="w-12 h-12 text-white" />,
    title: "Studerar din hudtyp",
    message: "Identifierar dina specifika hudbehov...",
    startProgress: 15,
    endProgress: 30
  },
  {
    icon: <Heart className="w-12 h-12 text-white" />,
    title: "Skapar livsstilsråd",
    message: "Anpassar rekommendationer för din dagliga rutin...",
    startProgress: 30,
    endProgress: 45
  },
  {
    icon: <Package className="w-12 h-12 text-white" />,
    title: "Väljer produkter",
    message: "Matchar perfekta produkter för just din hud...",
    startProgress: 45,
    endProgress: 60
  },
  {
    icon: <Shield className="w-12 h-12 text-white" />,
    title: "Planerar hudvårdsprotokoll",
    message: "Skapar din personliga 30-dagars hudresa...",
    startProgress: 60,
    endProgress: 75
  },
  {
    icon: <Star className="w-12 h-12 text-white" />,
    title: "Optimerar resultat",
    message: "Finjusterar dina rekommendationer...",
    startProgress: 75,
    endProgress: 90
  },
  {
    icon: <Sparkles className="w-12 h-12 text-white" />,
    title: "Förbereder din plan",
    message: "Din personliga hudvårdsresa är nästan klar!",
    startProgress: 90,
    endProgress: 100
  }
]

export function LoadingAnimation({ progress }: LoadingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [showPulse, setShowPulse] = useState(true)

  useEffect(() => {
    const phase = loadingPhases.findIndex(
      p => progress >= p.startProgress && progress < p.endProgress
    )
    if (phase !== -1 && phase !== currentPhase) {
      setCurrentPhase(phase)
      setShowPulse(false)
      setTimeout(() => setShowPulse(true), 100)
    }
  }, [progress, currentPhase])

  const activePhase = loadingPhases[currentPhase] || loadingPhases[0]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F3F0] flex items-center justify-center overflow-hidden">
      {/* Ambient background animation */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 bg-gradient-to-br from-[#8B6B47]/5 to-[#8B6B47]/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10 max-w-lg mx-auto px-6">
        {/* Animated Icon Container */}
        <div className="relative mb-12">
          <motion.div
            className="w-32 h-32 mx-auto"
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#8B6B47]/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Middle ring */}
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-[#8B6B47]/30"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            
            {/* Center circle with icon */}
            <motion.div
              className="absolute inset-4 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full flex items-center justify-center shadow-2xl"
              animate={{
                scale: showPulse ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: showPulse ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase}
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  {activePhase.icon}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#8B6B47]/40 rounded-full"
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * -100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </div>

        {/* Phase Title and Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">
              {activePhase.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {activePhase.message}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Section */}
        <div className="max-w-md mx-auto">
          {/* Percentage */}
          <motion.div 
            className="text-6xl font-light text-[#8B6B47] mb-6"
            key={Math.floor(progress)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(progress)}%
          </motion.div>
          
          {/* Progress Bar Container */}
          <div className="relative">
            {/* Background */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Main Progress */}
              <motion.div
                className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337] rounded-full relative"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </div>
            
            {/* Phase indicators */}
            <div className="absolute inset-0 flex justify-between items-center px-1">
              {loadingPhases.map((phase, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    progress >= phase.startProgress ? 'bg-[#8B6B47]' : 'bg-gray-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: progress >= phase.startProgress ? [1, 1.3, 1] : 0.8
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: progress >= phase.startProgress ? 0 : 0.1 * index
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fun facts that rotate */}
          <AnimatePresence mode="wait">
            <motion.p 
              key={Math.floor(progress / 20)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-gray-500 mt-8"
            >
              {progress < 20 && "💚 Visste du att CBD kan hjälpa till att balansera hudens naturliga oljor?"}
              {progress >= 20 && progress < 40 && "🌿 1753 använder endast naturliga, ekologiska ingredienser"}
              {progress >= 40 && progress < 60 && "✨ Din hudvårdsrutin anpassas efter din unika hudprofil"}
              {progress >= 60 && progress < 80 && "🔬 Våra formler är baserade på den senaste forskningen"}
              {progress >= 80 && "🎯 Nästan klart! Din personliga plan förbereds..."}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Company branding */}
        <motion.div 
          className="mt-12 text-gray-400 font-light tracking-widest text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          1753 SKINCARE
        </motion.div>
      </div>
    </div>
  )
} 