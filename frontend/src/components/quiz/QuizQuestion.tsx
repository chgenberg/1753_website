'use client'

import { motion } from 'framer-motion'
import { QuizQuestionData } from './quizData'

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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Question Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#93C560] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          {question.icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#014421] mb-3">
          {question.question}
        </h3>
        <p className="text-[#112A12] text-lg">
          {question.subtitle}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => onAnswer(question.id, option.value)}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
              selectedValue === option.value
                ? 'border-[#93C560] bg-[#93C560]/10 shadow-lg'
                : 'border-[#014421]/20 hover:border-[#93C560]/50 hover:bg-[#F3EFE3]/50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Option Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
                selectedValue === option.value
                  ? 'bg-[#93C560] text-white'
                  : 'bg-[#F3EFE3] text-[#014421] group-hover:bg-[#93C560]/20'
              }`}>
                {option.icon}
              </div>

              {/* Option Content */}
              <div className="flex-1">
                <h4 className={`font-semibold text-lg mb-2 transition-colors ${
                  selectedValue === option.value
                    ? 'text-[#014421]'
                    : 'text-[#014421] group-hover:text-[#014421]'
                }`}>
                  {option.label}
                </h4>
                <p className={`text-sm leading-relaxed transition-colors ${
                  selectedValue === option.value
                    ? 'text-[#112A12]'
                    : 'text-[#112A12]/80 group-hover:text-[#112A12]'
                }`}>
                  {option.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedValue === option.value
                  ? 'border-[#93C560] bg-[#93C560]'
                  : 'border-[#014421]/30 group-hover:border-[#93C560]'
              }`}>
                {selectedValue === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
} 