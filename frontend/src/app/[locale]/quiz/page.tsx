'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Calendar, Check, ChevronRight, ChevronLeft, 
  Sparkles, Heart, Sun, Moon, Droplets, Leaf, Timer, 
  AlertCircle, Shield, Home, Info, Camera, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ImprovedQuizResults from '@/components/quiz/ImprovedQuizResults'
import { LoadingAnimation } from '@/components/quiz/LoadingAnimation'
import FacePhotoAnalyzer, { ImageMetricsResult } from '@/components/quiz/FacePhotoAnalyzer'
import confetti from 'canvas-confetti'
import { Header } from '@/components/layout/Header'

interface UserInfo {
  email: string
  name: string
  gender: 'male' | 'female' | 'other' | ''
  age: string
}

export default function QuizPage() {
  type Step = 'welcome' | 'userInfo' | 'photo' | 'questions' | 'review' | 'loading' | 'results'
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: '',
    name: '',
    gender: '',
    age: ''
  })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [resumePrompt, setResumePrompt] = useState(false)
  const [activeDescendantId, setActiveDescendantId] = useState<string | undefined>(undefined)
  const [imageMetrics, setImageMetrics] = useState<ImageMetricsResult | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Focus heading on question change for better accessibility
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    if (currentStep === 'questions') {
      setTimeout(() => questionHeadingRef.current?.focus(), 50)
    }
  }, [currentStep, currentQuestion])

  // Confetti celebration on results
  useEffect(() => {
    if (currentStep === 'results') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.2 } })
      setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.2, x: 0.9 } }), 250)
    }
  }, [currentStep])

  // Gender-specific questions will be loaded based on user selection
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    // Offer resume from localStorage
    try {
      const raw = localStorage.getItem('quizProgress')
      if (raw) setResumePrompt(true)
    } catch {}
  }, [])

  const resumeFromStorage = () => {
    try {
      const raw = localStorage.getItem('quizProgress')
      if (raw) {
        const data = JSON.parse(raw)
        setUserInfo(data.userInfo || {})
        setAnswers(data.answers || {})
        setCurrentQuestion(data.currentQuestion || 0)
        setCurrentStep(data.currentStep || 'userInfo')
        if (data.userInfo?.gender) loadQuestions(data.userInfo.gender)
      }
    } catch (error) {
      console.error('Failed to resume quiz:', error)
    }
    setResumePrompt(false)
  }

  const saveProgress = () => {
    try {
      localStorage.setItem('quizProgress', JSON.stringify({
        userInfo,
        answers,
        currentQuestion,
        currentStep,
        timestamp: Date.now()
      }))
    } catch {}
  }

  const loadQuestions = (gender: string) => {
    const baseQuestions = [
      {
        id: 'skin_type',
        question: 'Hur skulle du beskriva din hudtyp?',
        icon: Droplets,
        options: [
          { 
            value: 'dry', 
            label: 'Torr', 
            description: 'Känns stram, fnasig eller matt',
            icon: '🏜️'
          },
          { 
            value: 'oily', 
            label: 'Fet', 
            description: 'Glansig, särskilt i T-zonen',
            icon: '💧'
          },
          { 
            value: 'combination', 
            label: 'Kombinerad', 
            description: 'Fet T-zon, torr på kinderna',
            icon: '🌗'
          },
          { 
            value: 'sensitive', 
            label: 'Känslig', 
            description: 'Reagerar lätt på produkter',
            icon: '🌸'
          },
          { 
            value: 'normal', 
            label: 'Normal', 
            description: 'Balanserad och problemfri',
            icon: '✨'
          }
        ]
      },
      {
        id: 'skin_concerns',
        question: 'Vilka är dina huvudsakliga hudproblem?',
        icon: Heart,
        multiple: true,
        options: [
          { value: 'acne', label: 'Akne & utbrott', icon: '🔴' },
          { value: 'aging', label: 'Åldrande & rynkor', icon: '⏰' },
          { value: 'pigmentation', label: 'Pigmentfläckar', icon: '🎨' },
          { value: 'redness', label: 'Rodnad & irritation', icon: '🌡️' },
          { value: 'dryness', label: 'Torrhet & fjällning', icon: '🏜️' },
          { value: 'pores', label: 'Stora porer', icon: '🕳️' },
          { value: 'dullness', label: 'Trist & livlös hud', icon: '☁️' },
          { value: 'sensitivity', label: 'Känslighet', icon: '🌸' }
        ]
      },
      {
        id: 'routine_time',
        question: 'Hur mycket tid lägger du på hudvård dagligen?',
        icon: Timer,
        options: [
          { value: 'minimal', label: '< 5 minuter', description: 'Snabb och enkel rutin', icon: '⚡' },
          { value: 'moderate', label: '5-15 minuter', description: 'Balanserad rutin', icon: '⏱️' },
          { value: 'extensive', label: '> 15 minuter', description: 'Omfattande rutin', icon: '🕰️' }
        ]
      },
      {
        id: 'lifestyle',
        question: 'Hur skulle du beskriva din livsstil?',
        icon: Sun,
        options: [
          { value: 'active', label: 'Aktiv & sportigt', icon: '🏃' },
          { value: 'balanced', label: 'Balanserad', icon: '⚖️' },
          { value: 'stressful', label: 'Stressig', icon: '😰' },
          { value: 'relaxed', label: 'Lugn & avslappnad', icon: '😌' }
        ]
      },
      {
        id: 'sleep_quality',
        question: 'Hur är din sömnkvalitet?',
        icon: Moon,
        options: [
          { value: 'excellent', label: 'Utmärkt (7-9h)', icon: '😴' },
          { value: 'good', label: 'Bra (6-7h)', icon: '😊' },
          { value: 'fair', label: 'Okej (5-6h)', icon: '😐' },
          { value: 'poor', label: 'Dålig (<5h)', icon: '😫' }
        ]
      },
      {
        id: 'diet_habits',
        question: 'Hur skulle du beskriva dina matvanor?',
        icon: Leaf,
        options: [
          { value: 'healthy', label: 'Hälsosam & balanserad', icon: '🥗' },
          { value: 'moderate', label: 'Varierande', icon: '🍽️' },
          { value: 'improving', label: 'Arbetar på det', icon: '📈' },
          { value: 'unhealthy', label: 'Kunde vara bättre', icon: '🍔' }
        ]
      },
      {
        id: 'environment',
        question: 'Vilken miljö vistas du mest i?',
        icon: Home,
        options: [
          { value: 'urban', label: 'Stad', description: 'Föroreningar & stress', icon: '🏙️' },
          { value: 'suburban', label: 'Förort', description: 'Balanserad miljö', icon: '🏘️' },
          { value: 'rural', label: 'Landsbygd', description: 'Ren luft', icon: '🌲' },
          { value: 'mixed', label: 'Varierat', description: 'Reser mycket', icon: '✈️' }
        ]
      }
    ]

    // Add gender-specific questions
    if (gender === 'female') {
      baseQuestions.push({
        id: 'hormonal_phase',
        question: 'Var befinner du dig hormonellt?',
        icon: Heart,
        options: [
          { value: 'regular', label: 'Regelbunden cykel', icon: '🔄' },
          { value: 'irregular', label: 'Oregelbunden cykel', icon: '〰️' },
          { value: 'pregnancy', label: 'Gravid/ammar', icon: '🤰' },
          { value: 'menopause', label: 'Klimakteriet', icon: '🦋' },
          { value: 'post_menopause', label: 'Efter klimakteriet', icon: '🌟' }
        ]
      })
    }

    setQuestions(baseQuestions)
  }

  const handleUserInfoSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!userInfo.name.trim()) newErrors.name = 'Namn krävs'
    if (!userInfo.email.trim()) newErrors.email = 'E-post krävs'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = 'Ogiltig e-postadress'
    }
    if (!userInfo.gender) newErrors.gender = 'Välj kön'
    if (!userInfo.age) newErrors.age = 'Ålder krävs'
    if (!privacyAccepted) newErrors.privacy = 'Du måste acceptera integritetspolicyn'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    loadQuestions(userInfo.gender)
    setCurrentStep('photo')
    saveProgress()
  }

  const handlePhotoAnalyzed = (metrics: ImageMetricsResult) => {
    setImageMetrics(metrics)
    setCurrentStep('questions')
    saveProgress()
  }

  const handleAnswer = (value: string | string[]) => {
    const question = questions[currentQuestion]
    setAnswers(prev => ({ ...prev, [question.id]: value }))
    saveProgress()

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setCurrentStep('review')
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    } else if (currentStep === 'questions') {
      setCurrentStep('photo')
    } else if (currentStep === 'photo') {
      setCurrentStep('userInfo')
    }
  }

  const submitQuiz = async () => {
    setCurrentStep('loading')
    
    // Simulate AI processing with progress
    const duration = 5000
    const interval = 50
    const steps = duration / interval
    const increment = 100 / steps

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          return 100
        }
        return next
      })
    }, interval)

    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers,
          imageMetrics,
          timestamp: new Date().toISOString()
        })
      })

      const data = await response.json()
      
      if (data.results) {
        setResults(data.results)
        
        // Save quiz data
        await fetch('/api/quiz/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInfo,
            answers,
            results: data.results,
            timestamp: new Date().toISOString()
          })
        })

        localStorage.removeItem('quizProgress')
      }
    } catch (error) {
      console.error('Quiz submission error:', error)
    } finally {
      clearInterval(timer)
      setLoadingProgress(100)
      setTimeout(() => setCurrentStep('results'), 500)
    }
  }

  const restartQuiz = () => {
    setCurrentStep('welcome')
    setUserInfo({ email: '', name: '', gender: '', age: '' })
    setAnswers({})
    setCurrentQuestion(0)
    setLoadingProgress(0)
    setResults(null)
    setImageMetrics(null)
    localStorage.removeItem('quizProgress')
  }

  const renderWelcome = () => (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={isMobile ? "/background/yoga_woman_mobile.png" : "/background/yoga_woman.png"}
          alt="Yoga Woman"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl md:text-6xl font-light text-white mb-6"
          >
            VÄLKOMMEN TILL DIN HUDRESA
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg md:text-xl text-white/90 mb-12 font-light"
          >
            Få personliga rekommendationer baserade på din unika hud
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => setCurrentStep(resumePrompt ? 'userInfo' : 'userInfo')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-white text-gray-900 rounded-full font-medium text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              STARTA HUDANALYS
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          {/* Resume Prompt */}
          <AnimatePresence>
            {resumePrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <button
                  onClick={resumeFromStorage}
                  className="text-white/80 hover:text-white underline text-sm transition-colors"
                >
                  Fortsätt där du slutade
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-6 text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>10-14 frågor</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>AI-stödd analys</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>100% säker</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )

  const renderUserInfo = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '20%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Steg 1 av 3</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-8 text-gray-900">
            Låt oss lära känna dig
          </h2>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vad heter du?
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ditt namn"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Din e-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="din@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kön
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'female', label: 'Kvinna', icon: '👩' },
                  { value: 'male', label: 'Man', icon: '👨' },
                  { value: 'other', label: 'Annat', icon: '🌈' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUserInfo(prev => ({ ...prev, gender: option.value as any }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userInfo.gender === option.value
                        ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ålder
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={userInfo.age}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                    errors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Din ålder"
                  min="13"
                  max="120"
                />
              </div>
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            {/* Privacy Consent */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#8B6B47] focus:ring-[#8B6B47] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Jag godkänner att mina uppgifter behandlas enligt{' '}
                  <Link href="/integritetspolicy" className="text-[#8B6B47] hover:underline">
                    integritetspolicyn
                  </Link>
                </span>
              </label>
              {errors.privacy && (
                <p className="text-red-500 text-sm mt-2">{errors.privacy}</p>
              )}
            </div>

            {/* Continue Button */}
            <motion.button
              onClick={handleUserInfoSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Fortsätt
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderPhoto = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '20%' }}
              animate={{ width: '40%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Steg 2 av 3</p>
        </div>

        {/* Back button */}
        <button
          onClick={() => setCurrentStep('userInfo')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">
              Ansiktsanalys (valfritt)
            </h2>
            <p className="text-lg text-gray-600">
              Ta eller ladda upp en bild för AI-driven hudanalys
            </p>
          </div>

          <FacePhotoAnalyzer 
            onAnalyze={handlePhotoAnalyzed}
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentStep('questions')}
              className="text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Hoppa över detta steg
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderQuestions = () => {
    const question = questions[currentQuestion]
    if (!question) return null

    const QuestionIcon = question.icon

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
        <Header />
        
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: `${40 + (currentQuestion / questions.length) * 40}%` }}
                animate={{ width: `${40 + ((currentQuestion + 1) / questions.length) * 40}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Fråga {currentQuestion + 1} av {questions.length}
            </p>
          </div>

          {/* Back button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>

          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B6B47]/10 rounded-full mb-4">
                <QuestionIcon className="w-8 h-8 text-[#8B6B47]" />
              </div>
              <h3 
                ref={questionHeadingRef}
                tabIndex={-1}
                className="text-2xl md:text-3xl font-light text-gray-900"
              >
                {question.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option: any) => {
                const isSelected = question.multiple
                  ? answers[question.id]?.includes(option.value)
                  : answers[question.id] === option.value

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      if (question.multiple) {
                        const current = answers[question.id] || []
                        const updated = current.includes(option.value)
                          ? current.filter((v: string) => v !== option.value)
                          : [...current, option.value]
                        handleAnswer(updated)
                      } else {
                        handleAnswer(option.value)
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#8B6B47] bg-[#8B6B47]/10 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl flex-shrink-0">{option.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-[#8B6B47] flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Skip/Continue for multiple choice */}
            {question.multiple && (
              <motion.button
                onClick={() => handleAnswer(answers[question.id] || [])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {(answers[question.id] || []).length > 0 ? 'Fortsätt' : 'Hoppa över'}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  const renderReview = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '80%' }}
              animate={{ width: '90%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Nästan klar!</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">
              Granska dina svar
            </h2>
            <p className="text-lg text-gray-600">
              Kontrollera att allt stämmer innan vi analyserar din hudprofil
            </p>
          </div>

          {/* Review Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {questions.map((question) => {
              const answer = answers[question.id]
              const QuestionIcon = question.icon
              
              return (
                <div key={question.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <QuestionIcon className="w-5 h-5 text-[#8B6B47] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">{question.question}</p>
                      <p className="text-gray-900">
                        {Array.isArray(answer)
                          ? answer.map(v => question.options.find((o: any) => o.value === v)?.label).join(', ')
                          : question.options.find((o: any) => o.value === answer)?.label || 'Inget svar'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentStep('questions')}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Ändra svar
            </button>
            <motion.button
              onClick={submitQuiz}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Analysera min hud
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <Header />
      <LoadingAnimation progress={loadingProgress} />
    </div>
  )

  const renderResults = () => (
    <>
      {results && (
        <ImprovedQuizResults
          results={results}
          userInfo={userInfo}
          imageMetrics={imageMetrics}
        />
      )}
    </>
  )

  return (
    <>
      {currentStep === 'welcome' && renderWelcome()}
      {currentStep === 'userInfo' && renderUserInfo()}
      {currentStep === 'photo' && renderPhoto()}
      {currentStep === 'questions' && renderQuestions()}
      {currentStep === 'review' && renderReview()}
      {currentStep === 'loading' && renderLoading()}
      {currentStep === 'results' && renderResults()}
    </>
  )
} 