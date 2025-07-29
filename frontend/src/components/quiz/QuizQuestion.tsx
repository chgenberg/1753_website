'use client'

import { motion } from 'framer-motion'
import { QuizQuestionData } from './quizData'
import { Check } from 'lucide-react'

interface QuizQuestionProps {
  question: QuizQuestionData
  selectedValue?: string
  onAnswer: (questionId: string, value: string) => void
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedValue,
  onAnswer
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Question Header - More Compact */}
      <div className="text-center mb-6 md:mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 md:w-20 md:h-20 bg-[#4A3428] rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4"
        >
          <span className="filter grayscale-0">{question.icon || '🎯'}</span>
        </motion.div>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {question.question || question.text}
        </h3>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          {question.subtitle || question.description}
        </p>
      </div>

      {/* Question Options - Updated Grid Layout */}
      <div className={`grid gap-3 ${
        // Mobile: 1 column, Desktop: 2 columns for compact squares
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
      }`}>
        {question.options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(question.id, option.value)}
            className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 group ${
              selectedValue === option.value
                ? 'border-[#4A3428] bg-[#4A3428] text-white shadow-xl'
                : 'border-gray-200 hover:border-[#4A3428]/50 hover:shadow-lg bg-white'
            }`}
          >
            <div className="flex items-center md:items-start gap-4">
              {/* Option Icon - Left aligned on desktop, centered on mobile */}
              <div className={`w-14 h-14 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                selectedValue === option.value
                  ? 'bg-white/20'
                  : 'bg-[#4A3428]/10 group-hover:bg-[#4A3428]/20'
              }`}>
                <span className="text-xl md:text-lg">{option.icon || option.emoji}</span>
              </div>

              {/* Option Content - Aligned with icon */}
              <div className="text-left flex-1">
                <h4 className={`font-semibold text-base mb-1 ${
                  selectedValue === option.value
                    ? 'text-white'
                    : 'text-gray-900'
                }`}>
                  {option.label}
                </h4>
                {option.description && (
                  <p className={`text-xs leading-relaxed line-clamp-2 ${
                    selectedValue === option.value
                      ? 'text-white/80'
                      : 'text-gray-600'
                  }`}>
                    {option.description}
                  </p>
                )}
              </div>

              {/* Selection Indicator - Right aligned */}
              {selectedValue === option.value && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-4 h-4 text-[#4A3428]" strokeWidth={3} />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Mobile-friendly hint */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-gray-500 mt-4 md:hidden"
      >
        Tryck för att välja
      </motion.p>
    </motion.div>
  )
} 