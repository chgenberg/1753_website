'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { questions } from '@/components/quiz/quizData';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizPage() {
  const t = useTranslations('Quiz');
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 for welcome screen
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const totalQuestions = questions.length;
  const progress = currentQuestion === -1 ? 0 : ((currentQuestion + 1) / totalQuestions) * 100;

  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && userEmail) {
      setCurrentQuestion(0);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // All questions answered, start loading
      setIsLoading(true);
      
      // Animate loading progress
      const duration = 4500; // 4.5 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      const increment = 100 / steps;
      
      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += increment;
        setLoadingProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= 100) {
          clearInterval(timer);
          // Calculate results after loading
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
      // Mock results for now
      setResults({
        skinType: 'normal',
        recommendedProducts: ['duo-kit', 'face-oil', 'cream'],
        tips: ['Tip 1', 'Tip 2', 'Tip 3']
      });
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentQuestion === 0) {
      setCurrentQuestion(-1);
    }
  };

  if (results) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl overflow-y-auto z-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen py-12 px-4"
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4 uppercase"
              >
                Din Personliga Hudanalys
              </motion.h1>
              <p className="text-xl text-white/80">Hej {results.name}, här är dina resultat</p>
            </div>

            {/* Analysis Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 md:p-12 mb-8"
            >
              {results.analysis ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: results.analysis.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black uppercase tracking-wide">$1</strong>')
                      .replace(/\n\n/g, '</p><p class="mb-6">')
                      .replace(/^/, '<p class="mb-6">')
                      .replace(/$/, '</p>')
                      .replace(/\n(\d+\.)/g, '</p><h3 class="text-xl font-medium mt-8 mb-4 uppercase">$1')
                      .replace(/(\d+\.\s.*?):/g, '$1</h3><p class="mb-6">')
                  }}
                />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium uppercase mb-2">Din hudtyp</h3>
                    <p className="text-gray-600">{results.skinType}</p>
                  </div>
                  {results.tips && (
                    <div>
                      <h3 className="text-xl font-medium uppercase mb-2">Tips för dig</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {results.tips.map((tip: string, index: number) => (
                          <li key={index} className="text-gray-600">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recommended Products */}
            {results.recommendedProducts && results.recommendedProducts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-6 uppercase text-center">
                  Rekommenderade Produkter
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.recommendedProducts.map((productSlug: string) => {
                    const productNames: Record<string, string> = {
                      'duo-kit': 'DUO Kit',
                      'face-oil': 'Face Oil', 
                      'the-serum': 'The Serum',
                      'the-cream': 'The Cream',
                      'body-oil': 'Body Oil',
                      'oil-cleanser': 'Oil Cleanser',
                      'gua-sha': 'Gua Sha'
                    };
                    
                    return (
                      <div key={productSlug} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                        <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4"></div>
                        <h3 className="text-white font-medium uppercase tracking-wide">
                          {productNames[productSlug] || productSlug}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                onClick={() => window.location.href = '/products'}
                className="bg-white text-black px-8 py-4 rounded-full hover:bg-gray-100 transition-colors uppercase tracking-wide font-medium"
              >
                Se alla produkter
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full hover:bg-white/10 transition-colors uppercase tracking-wide font-medium"
              >
                Tillbaka till startsidan
              </button>
            </motion.div>

            {/* Close button */}
            <button
              onClick={() => window.location.href = '/'}
              className="fixed top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-8 uppercase">
            Analyserar dina svar...
          </h2>
          <div className="relative mb-6">
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
                  width: `${loadingProgress}%`
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="absolute -top-8 left-0 w-full">
              <motion.div 
                className="text-white text-4xl font-light"
                style={{ left: `${loadingProgress}%` }}
                transition={{ duration: 0.1 }}
              >
                {Math.round(loadingProgress)}%
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        {currentQuestion >= 0 && (
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
        )}

        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {currentQuestion === -1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 md:p-12"
            >
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6 uppercase">
                Hej! Vad roligt att du vill göra vårt QUIZ!
              </h1>
              <p className="text-gray-600 mb-8">
                Först och främst... Vad heter du? och vilken mejladress har du?
              </p>
              <form onSubmit={handleWelcomeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 uppercase tracking-wide">
                    Ditt namn
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ange ditt namn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 uppercase tracking-wide">
                    Din e-postadress
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="namn@exempel.se"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide"
                >
                  Börja quiz
                </button>
              </form>
            </motion.div>
          )}

          {/* Questions */}
          {currentQuestion >= 0 && currentQuestion < questions.length && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 md:p-12"
            >
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2 uppercase">
                  {questions[currentQuestion].text}
                </h2>
                {questions[currentQuestion].description && (
                  <p className="text-gray-600">
                    {questions[currentQuestion].description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-black transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="flex-1">
                        <p className="font-medium uppercase tracking-wide group-hover:text-black transition-colors">
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <button
                  onClick={goToPrevious}
                  className="mt-6 text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
                >
                  ← Tillbaka
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button */}
        <button
          onClick={() => window.location.href = '/'}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 