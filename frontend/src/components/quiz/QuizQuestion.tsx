'use client'

import { motion } from 'framer-motion'
import { QuizQuestionData } from './quizData'
import { Check } from 'lucide-react'

interface QuizQuestionProps {
  question: QuizQuestionData
  selectedValue?: string
  onAnswer: (questionId: number, value: string) => void
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
          className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center text-2xl md:text-3xl mx-auto mb-4"
        >
          <span className="filter grayscale-0">{question.icon}</span>
        </motion.div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h3>
        <p className="text-gray-600 text-sm md:text-base">
          {question.subtitle}
        </p>
      </div>

      {/* Options Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
        {question.options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(question.id, option.value)}
            className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedValue === option.value
                ? 'border-black bg-black text-white shadow-xl'
                : 'border-gray-200 hover:border-gray-400 hover:shadow-lg bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Option Icon - Smaller and Cleaner */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                selectedValue === option.value
                  ? 'bg-white/20'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <span className="text-lg">{option.icon}</span>
              </div>

              {/* Option Content - Compact */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm md:text-base mb-1 ${
                  selectedValue === option.value
                    ? 'text-white'
                    : 'text-gray-900'
                }`}>
                  {option.label}
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  selectedValue === option.value
                    ? 'text-white/80'
                    : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </div>

              {/* Selection Indicator - Simplified */}
              {selectedValue === option.value && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-4 h-4 text-black" strokeWidth={3} />
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