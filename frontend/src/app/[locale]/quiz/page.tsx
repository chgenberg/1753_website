'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { questions } from '@/components/quiz/quizData';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from '@/components/quiz/LoadingAnimation';
import { QuizResults } from '@/components/quiz/QuizResults';
import { User, Mail, Shield, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { RegisterModal } from '@/components/auth/RegisterModal';

export default function QuizPage() {
  const t = useTranslations('Quiz');
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome', 'questions', 'loading', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, privacy?: string}>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalQuestions = questions.length;
  const progress = currentStep === 'questions' ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle welcome form submission
  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {name?: string, email?: string, privacy?: string} = {};

    // Validate name
    if (!userName.trim()) {
      newErrors.name = 'Vänligen ange ditt namn';
    }

    // Validate email
    if (!userEmail.trim()) {
      newErrors.email = 'Vänligen ange din e-postadress';
    } else if (!isValidEmail(userEmail)) {
      newErrors.email = 'Vänligen ange en giltig e-postadress';
    }

    // Validate privacy
    if (!privacyAccepted) {
      newErrors.privacy = 'Du måste godkänna vår integritetspolicy för att fortsätta';
    }

    setErrors(newErrors);

    // If no errors, proceed to questions
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep('questions');
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    const currentQuestionData = questions[currentQuestion]
    
    if (currentQuestionData.multiSelect) {
      // For multi-select questions, toggle the answer
      const currentAnswers = answers[questionId] ? answers[questionId].split(',') : []
      const answerIndex = currentAnswers.indexOf(answer)
      
      if (answerIndex > -1) {
        // Remove answer if already selected
        currentAnswers.splice(answerIndex, 1)
      } else {
        // Add answer if not selected
        currentAnswers.push(answer)
      }
      
      setAnswers({ ...answers, [questionId]: currentAnswers.join(',') })
    } else {
      // For single-select questions, replace the answer and move to next
      setAnswers({ ...answers, [questionId]: answer })
      
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
      } else {
        // All questions answered, start loading
        setTimeout(() => {
          setCurrentStep('loading')
          setIsLoading(true)
          
          // Animate loading progress
          const duration = 4500
          const interval = 50
          const steps = duration / interval
          const increment = 100 / steps
          
          let currentProgress = 0
          const timer = setInterval(() => {
            currentProgress += increment
            setLoadingProgress(Math.min(currentProgress, 100))
            
            if (currentProgress >= 100) {
              clearInterval(timer)
              setTimeout(() => {
                calculateResults()
              }, 500)
            }
          }, interval)
        }, 300)
      }
    }
  }

  const calculateResults = async () => {
    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          name: userName,
          email: userEmail 
        }),
      });
      const data = await response.json();
      setResults(data);
      setCurrentStep('results');
      
      // Track quiz completion in Drip
      if (userEmail) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/newsletter/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              action: 'quiz_completed',
              data: {
                answers,
                results: data,
                name: userName
              }
            })
          });
        } catch (trackingError) {
          console.error('Error tracking quiz completion:', trackingError);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating results:', error);
      setResults({
        skinType: 'normal',
        recommendedProducts: ['duo-kit', 'face-oil', 'cream'],
        tips: ['Tip 1', 'Tip 2', 'Tip 3']
      });
      setCurrentStep('results');
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentQuestion === 0) {
      setCurrentStep('welcome');
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (currentStep === 'loading') {
    return <LoadingAnimation progress={loadingProgress} />;
  }

  if (currentStep === 'results' && results) {
    return (
      <>
        <QuizResults 
          answers={answers} 
          userName={userName}
          userEmail={userEmail}
          results={results} 
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? "/QUIZ/bathroom_mobile.png" : "/QUIZ/bathroom_desktop.png"}
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60" />
      </div>

      <div className="relative z-10 max-w-2xl w-full p-4">
        {/* Welcome Screen */}
        {currentStep === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 uppercase tracking-wider">
                Välkommen till din
              </h1>
              <h2 className="text-2xl md:text-3xl text-[#8B6B47] font-semibold uppercase mb-4">
                Kostnadsfria Hudanalys
              </h2>
              <p className="text-gray-600 mt-4 max-w-md mx-auto">
                Få personliga rekommendationer för livsstil, produkter och kost på bara 2 minuter
              </p>
            </div>

            <form onSubmit={handleWelcomeSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Name Input */}
              <div className="text-left">
                <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                  <User className="w-4 h-4 mr-2 text-[#8B6B47]" />
                  Vad är ditt namn?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ditt förnamn"
                  className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B6B47] transition-colors`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Input */}
              <div className="text-left">
                <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 mr-2 text-[#8B6B47]" />
                  Vilken är din e-postadress?
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="din@email.com"
                  className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B6B47] transition-colors`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Privacy Policy */}
              <div className="text-left">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-[#8B6B47] focus:ring-[#8B6B47] border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm">
                      Jag godkänner{' '}
                      <a href="/privacy-policy" target="_blank" className="text-[#8B6B47] hover:text-[#6B5337] underline">
                        integritetspolicyn
                      </a>{' '}
                      och samtycker till att få personliga hudvårdsrekommendationer
                    </div>
                    {errors.privacy && <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>}
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center px-8 py-4 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2A1E] transition-all duration-300 shadow-lg"
              >
                <span>Starta Min Hudanalys</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 text-gray-500 text-xs mt-6">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#8B6B47] rounded-full"></div>
                  100% Kostnadsfritt
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#8B6B47] rounded-full"></div>
                  2 minuter
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#8B6B47] rounded-full"></div>
                  AI-driven
                </span>
              </div>
            </form>
          </motion.div>
        )}

        {/* Questions */}
        {currentStep === 'questions' && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">
                  Fråga {currentQuestion + 1} av {totalQuestions}
                </span>
                <span className="text-gray-600 text-sm">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <div className="text-center mb-6">
                  {questions[currentQuestion]?.icon && (
                    <div className="text-3xl mb-3">{questions[currentQuestion].icon}</div>
                  )}
                  <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">
                    {questions[currentQuestion]?.text}
                  </h2>
                  {questions[currentQuestion]?.description && (
                    <p className="text-gray-600 text-sm">
                      {questions[currentQuestion].description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {questions[currentQuestion]?.options.map((option) => {
                    const isMultiSelect = questions[currentQuestion].multiSelect
                    const currentAnswers = answers[questions[currentQuestion].id]?.split(',') || []
                    const isSelected = isMultiSelect 
                      ? currentAnswers.includes(option.value)
                      : answers[questions[currentQuestion].id] === option.value
                    
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                            : 'border-gray-200 hover:border-[#8B6B47]/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{option.emoji}</span>
                          <div className="flex-1">
                            <h3 className={`font-medium text-sm ${isSelected ? 'text-[#4A3428]' : 'text-gray-900'}`}>
                              {option.label}
                            </h3>
                            {option.description && (
                              <p className={`text-xs mt-0.5 ${isSelected ? 'text-[#6B5337]' : 'text-gray-500'}`}>
                                {option.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 bg-[#8B6B47] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Continue button for multi-select questions */}
                {questions[currentQuestion]?.multiSelect && (
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      onClick={() => {
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(currentQuestion + 1)
                        } else {
                          // Start loading if this was the last question
                          setCurrentStep('loading')
                          setIsLoading(true)
                          
                          const duration = 4500
                          const interval = 50
                          const steps = duration / interval
                          const increment = 100 / steps
                          
                          let currentProgress = 0
                          const timer = setInterval(() => {
                            currentProgress += increment
                            setLoadingProgress(Math.min(currentProgress, 100))
                            
                            if (currentProgress >= 100) {
                              clearInterval(timer)
                              setTimeout(() => {
                                calculateResults()
                              }, 500)
                            }
                          }, interval)
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!answers[questions[currentQuestion].id]}
                      className="px-6 py-2.5 bg-[#4A3428] text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md"
                    >
                      <span>Fortsätt</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={goToPrevious}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-[#8B6B47] transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Föregående
              </button>
              
              {answers[questions[currentQuestion]?.id] && !questions[currentQuestion]?.multiSelect && (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center px-4 py-2 bg-[#4A3428] text-white rounded-full text-sm font-medium hover:bg-[#3A2A1E] transition-colors"
                >
                  {currentQuestion === questions.length - 1 ? 'Få Mina Resultat' : 'Nästa'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Register Modal */}
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          quizData={{
            answers,
            results,
            userName,
            userEmail
          }}
        />
      </div>
    </div>
  );
} 