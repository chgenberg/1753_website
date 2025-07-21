'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LoadingAnimationProps {
  progress: number
}

export function LoadingAnimation({ progress }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-24 h-24 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-light text-gray-900 mb-2 uppercase tracking-wider">
          Analyserar dina svar
        </h2>
        <p className="text-gray-600 mb-8">
          Vår AI skapar en <span className="text-[#8B6B47] font-medium">personlig</span> hudvårdsprofil för dig
        </p>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="text-5xl font-light text-[#8B6B47] mb-4">
            {Math.round(progress)}%
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Loading Text */}
          <motion.p 
            className="text-sm text-gray-500 mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💚 Förbereder dina skräddarsydda resultat...
          </motion.p>
        </div>

        {/* Company Logo/Text */}
        <div className="mt-12 text-gray-400 font-light tracking-widest text-sm">
          1753 SKINCARE
        </div>
      </div>
    </div>
  )
} 