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

      {/* Options Grid - Box Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {question.options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(question.id, option.value)}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-center group ${
              selectedValue === option.value
                ? 'border-[#4A3428] bg-[#4A3428] text-white shadow-xl'
                : 'border-gray-200 hover:border-[#4A3428]/50 hover:shadow-lg bg-white'
            }`}
          >
            {/* Option Icon - Centered */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${
              selectedValue === option.value
                ? 'bg-white/20'
                : 'bg-[#4A3428]/10 group-hover:bg-[#4A3428]/20'
            }`}>
              <span className="text-2xl">{option.icon || option.emoji}</span>
            </div>

            {/* Option Content - Centered */}
            <div>
              <h4 className={`font-semibold text-base md:text-lg mb-1 ${
                selectedValue === option.value
                  ? 'text-white'
                  : 'text-gray-900'
              }`}>
                {option.label}
              </h4>
              {option.description && (
                <p className={`text-xs md:text-sm leading-relaxed ${
                  selectedValue === option.value
                    ? 'text-white/80'
                    : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              )}
            </div>

            {/* Selection Indicator - Top Right Corner */}
            {selectedValue === option.value && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-[#4A3428]" strokeWidth={3} />
              </motion.div>
            )}
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