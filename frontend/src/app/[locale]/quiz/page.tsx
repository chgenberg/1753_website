'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { questions } from '@/components/quiz/quizData';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from '@/components/quiz/LoadingAnimation';
import { QuizResultsMockup } from '@/components/quiz/QuizResultsMockup';
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
    setAnswers({ ...answers, [questionId]: answer });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // All questions answered, start loading
      setCurrentStep('loading');
      setIsLoading(true);
      
      // Animate loading progress
      const duration = 4500;
      const interval = 50;
      const steps = duration / interval;
      const increment = 100 / steps;
      
      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += increment;
        setLoadingProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            calculateResults();
          }, 500);
        }
      }, interval);
    }
  };

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
        <QuizResultsMockup answers={{ ...answers, userName, userEmail, results }} />
        
        {/* Action Buttons Overlay */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-4 z-50">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-xl font-medium hover:from-amber-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105"
            >
              <User className="w-5 h-5 mr-2" />
              Spara Resultat & Skapa Konto
            </button>
            
            <button
              onClick={() => {
                setCurrentStep('welcome');
                setCurrentQuestion(0);
                setAnswers({});
                setResults(null);
                setUserName('');
                setUserEmail('');
                setPrivacyAccepted(false);
              }}
              className="px-8 py-4 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Gör Om Quiz
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        {/* Welcome Screen */}
        {currentStep === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 uppercase tracking-tight">
                Välkommen till din
              </h1>
              <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent font-medium uppercase">
                Kostnadsfria Hudanalys
              </h2>
              <p className="text-lg text-white/80 mt-4 max-w-lg mx-auto">
                Få personliga rekommendationer för livsstil, produkter och kost på bara 2 minuter
              </p>
            </div>

            <form onSubmit={handleWelcomeSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="text-left">
                <label className="flex items-center text-white font-medium mb-2">
                  <User className="w-5 h-5 mr-2" />
                  Vad är ditt namn?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ditt förnamn"
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.name ? 'border-red-400' : 'border-white/20'} rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-amber-400 transition-colors`}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Input */}
              <div className="text-left">
                <label className="flex items-center text-white font-medium mb-2">
                  <Mail className="w-5 h-5 mr-2" />
                  Vilken är din e-postadress?
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="din@email.com"
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/20'} rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-amber-400 transition-colors`}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Privacy Policy */}
              <div className="text-left">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-amber-400 focus:ring-amber-400 border-white/20 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center text-white/90 text-sm">
                      <Shield className="w-4 h-4 mr-2 text-amber-400" />
                      <span>
                        Jag godkänner{' '}
                        <a href="/privacy-policy" target="_blank" className="text-amber-400 hover:text-amber-300 underline">
                          integritetspolicyn
                        </a>{' '}
                        och samtycker till att få personliga hudvårdsrekommendationer
                      </span>
                    </div>
                    {errors.privacy && <p className="text-red-400 text-sm mt-1">{errors.privacy}</p>}
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-xl font-semibold hover:from-amber-300 hover:to-orange-300 transition-all duration-300 text-lg"
              >
                <span>Starta Min Hudanalys</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 text-white/60 text-xs mt-6">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  100% Kostnadsfritt
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  2 minuter
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
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
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-sm uppercase tracking-wide">
                  Fråga {currentQuestion + 1} av {totalQuestions}
                </span>
                <span className="text-white/60 text-sm">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
                    width: `${progress}%`
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-8"
              >
                <div className="text-center mb-8">
                  {questions[currentQuestion]?.icon && (
                    <div className="text-4xl mb-4">{questions[currentQuestion].icon}</div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                    {questions[currentQuestion]?.text}
                  </h2>
                  {questions[currentQuestion]?.description && (
                    <p className="text-gray-600">
                      {questions[currentQuestion].description}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  {questions[currentQuestion]?.options.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        answers[questions[currentQuestion].id] === option.value
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-4">{option.emoji}</span>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={goToPrevious}
                className="flex items-center px-6 py-3 text-white hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Föregående
              </button>
              
              {answers[questions[currentQuestion]?.id] && (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center px-6 py-3 bg-amber-400 text-black rounded-xl font-medium hover:bg-amber-300 transition-colors"
                >
                  {currentQuestion === questions.length - 1 ? 'Få Mina Resultat' : 'Nästa'}
                  <ArrowRight className="w-5 h-5 ml-2" />
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