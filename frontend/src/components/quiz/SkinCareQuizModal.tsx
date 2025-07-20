'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import { questions } from './quizData'

interface SkinCareQuizModalProps {
  onClose: () => void
}

export const SkinCareQuizModal: React.FC<SkinCareQuizModalProps> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Quiz completed, show results
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setShowResults(true)
      }, 2000) // Simulate AI processing time
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setIsLoading(false)
  }

  const currentQuestionData = questions[currentQuestion]
  const hasAnswered = answers[currentQuestionData?.id] !== undefined

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-[#93C560] rounded-full flex items-center justify-center text-3xl mx-auto mb-6 animate-pulse">
            🧠
          </div>
          <h3 className="text-2xl font-bold text-[#4A3428] mb-4">
            Analyserar dina svar...
          </h3>
          <p className="text-[#112A12] mb-6">
            Vårt AI-system skapar personaliserade rekommendationer baserat på dina svar.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#93C560] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#F3EFE3] px-6 py-4 border-b border-[#4A3428]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#4A3428] rounded-full flex items-center justify-center text-white font-bold">
                🧴
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4A3428]">
                  {showResults ? 'Dina Personliga Rekommendationer' : 'Hudvårdsquiz'}
                </h2>
                {!showResults && (
                  <p className="text-sm text-[#112A12]">
                    Fråga {currentQuestion + 1} av {questions.length}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#4A3428]/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#4A3428]" />
            </button>
          </div>

          {/* Progress Bar */}
          {!showResults && (
            <div className="mt-4">
              <div className="w-full bg-[#4A3428]/20 rounded-full h-2">
                <motion.div
                  className="bg-[#93C560] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {showResults ? (
              <QuizResults
                answers={answers}
                onRestart={restartQuiz}
                onClose={onClose}
              />
            ) : (
              <QuizQuestion
                key={currentQuestion}
                question={currentQuestionData}
                selectedValue={answers[currentQuestionData.id]}
                onAnswer={handleAnswer}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {!showResults && (
          <div className="bg-[#F3EFE3] px-6 py-4 border-t border-[#4A3428]/10 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 text-[#4A3428] hover:bg-[#4A3428]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Föregående
            </button>

            <div className="flex items-center gap-2">
              {questions.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentQuestion ? 'bg-[#93C560]' : 'bg-[#4A3428]/20'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={!hasAnswered}
              className="flex items-center gap-2 px-6 py-3 bg-[#4A3428] text-white rounded-lg hover:bg-[#112A12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {currentQuestion === questions.length - 1 ? 'Få Mina Rekommendationer' : 'Nästa'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
} 