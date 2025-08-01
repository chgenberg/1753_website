'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Calendar, Check, ChevronRight, ChevronLeft, 
  Sparkles, Heart, Sun, Moon, Droplets, Leaf, Timer, 
  AlertCircle, Shield, Home
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ImprovedQuizResults from '@/components/quiz/ImprovedQuizResults'

// Soft cloud shape component
const CloudShape = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    className={`relative ${className}`}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
      <path
        d="M 20,50 Q 20,20 50,20 Q 80,10 120,20 Q 150,20 180,50 Q 180,80 150,80 Q 120,90 80,80 Q 50,80 20,50"
        fill="currentColor"
        className="text-white/90 drop-shadow-lg"
      />
    </svg>
    <div className="relative z-10 p-8">
      {children}
    </div>
  </motion.div>
)

interface UserInfo {
  email: string
  name: string
  gender: 'male' | 'female' | 'other' | ''
  age: string
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'userInfo' | 'questions' | 'loading' | 'results'>('welcome')
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

  // Gender-specific questions will be loaded based on user selection
  const [questions, setQuestions] = useState<any[]>([])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleUserInfoSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!userInfo.email) {
      newErrors.email = 'E-postadress krävs'
    } else if (!validateEmail(userInfo.email)) {
      newErrors.email = 'Ogiltig e-postadress'
    }

    if (!userInfo.name) {
      newErrors.name = 'Namn krävs'
    }

    if (!userInfo.gender) {
      newErrors.gender = 'Vänligen välj kön'
    }

    if (!userInfo.age) {
      newErrors.age = 'Ålder krävs'
    } else if (parseInt(userInfo.age) < 15 || parseInt(userInfo.age) > 100) {
      newErrors.age = 'Ange en giltig ålder (15-100)'
    }

    if (!privacyAccepted) {
      newErrors.privacy = 'Du måste acceptera integritetspolicyn'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    loadQuestionsForUser()
    setCurrentStep('questions')
  }

  const loadQuestionsForUser = () => {
    // This would load dynamic questions based on gender and age
    // For now, using a base set
    setQuestions(getQuestionsForUser(userInfo))
  }

  const getQuestionsForUser = (info: UserInfo) => {
    // Base questions that everyone gets
    const baseQuestions = [
      {
        id: 'skin_type',
        text: 'Hur skulle du beskriva din hudtyp?',
        type: 'single',
        options: [
          { value: 'dry', label: 'Torr', icon: '🏜️', description: 'Känns stram och kan fjälla' },
          { value: 'oily', label: 'Oljig', icon: '💧', description: 'Glansig, särskilt i T-zonen' },
          { value: 'combination', label: 'Kombinerad', icon: '🎭', description: 'Torr på vissa ställen, oljig på andra' },
          { value: 'normal', label: 'Normal', icon: '✨', description: 'Välbalanserad utan större problem' },
          { value: 'sensitive', label: 'Känslig', icon: '🌸', description: 'Reagerar lätt på produkter' }
        ]
      },
      {
        id: 'skin_concerns',
        text: 'Vilka hudproblem vill du främst adressera?',
        type: 'multiple',
        options: [
          { value: 'acne', label: 'Akne', icon: '🔴', description: '' },
          { value: 'aging', label: 'Åldrande', icon: '⏰', description: '' },
          { value: 'pigmentation', label: 'Pigmentering', icon: '🎨', description: '' },
          { value: 'redness', label: 'Rodnad', icon: '🌹', description: '' },
          { value: 'dryness', label: 'Torrhet', icon: '🏜️', description: '' },
          { value: 'oiliness', label: 'Oljighet', icon: '💧', description: '' },
          { value: 'sensitivity', label: 'Känslighet', icon: '🌸', description: '' },
          { value: 'texture', label: 'Ojämn hudstruktur', icon: '🏔️', description: '' }
        ]
      },
      {
        id: 'lifestyle_stress',
        text: 'Hur skulle du beskriva din stressnivå i vardagen?',
        type: 'single',
        options: [
          { value: 'low', label: 'Låg', icon: '😌', description: 'Jag känner mig oftast lugn och avslappnad' },
          { value: 'moderate', label: 'Måttlig', icon: '😐', description: 'Normal vardagsstress som jag hanterar bra' },
          { value: 'high', label: 'Hög', icon: '😰', description: 'Känner mig ofta stressad' },
          { value: 'very_high', label: 'Mycket hög', icon: '😣', description: 'Konstant stress som påverkar mitt välmående' }
        ]
      },
      {
        id: 'sleep_quality',
        text: 'Hur är din sömnkvalitet?',
        type: 'single',
        options: [
          { value: 'excellent', label: 'Utmärkt', icon: '😴', description: '7-9 timmar djup sömn' },
          { value: 'good', label: 'Bra', icon: '😪', description: 'Sover oftast gott' },
          { value: 'fair', label: 'Okej', icon: '😑', description: 'Vaknar ibland på natten' },
          { value: 'poor', label: 'Dålig', icon: '😫', description: 'Svårt att somna eller sova djupt' }
        ]
      },
      {
        id: 'water_intake',
        text: 'Hur mycket vatten dricker du dagligen?',
        type: 'single',
        options: [
          { value: 'less_1L', label: 'Mindre än 1 liter', icon: '💧', description: '' },
          { value: '1_2L', label: '1-2 liter', icon: '💧💧', description: '' },
          { value: '2_3L', label: '2-3 liter', icon: '💧💧💧', description: '' },
          { value: 'more_3L', label: 'Mer än 3 liter', icon: '💧💧💧💧', description: '' }
        ]
      },
      {
        id: 'sun_exposure',
        text: 'Hur mycket tid spenderar du utomhus i solljus?',
        type: 'single',
        options: [
          { value: 'minimal', label: 'Minimal', icon: '🏢', description: 'Mest inomhus' },
          { value: 'moderate', label: 'Måttlig', icon: '⛅', description: '30-60 min dagligen' },
          { value: 'high', label: 'Mycket', icon: '☀️', description: '1-3 timmar dagligen' },
          { value: 'extensive', label: 'Omfattande', icon: '🏖️', description: 'Mer än 3 timmar' }
        ]
      },
      {
        id: 'diet_quality',
        text: 'Hur skulle du beskriva din kost?',
        type: 'single',
        options: [
          { value: 'whole_foods', label: 'Hela livsmedel', icon: '🥗', description: 'Mest obearbetad mat' },
          { value: 'balanced', label: 'Balanserad', icon: '🍱', description: 'Blandning av hälsosamt och mindre hälsosamt' },
          { value: 'processed', label: 'Bearbetad', icon: '🍕', description: 'Mycket färdigmat och snabbmat' },
          { value: 'special', label: 'Specialkost', icon: '🌱', description: 'Vegetarisk/vegan/keto etc.' }
        ]
      },
      {
        id: 'exercise_frequency',
        text: 'Hur ofta tränar du?',
        type: 'single',
        options: [
          { value: 'never', label: 'Aldrig', icon: '🛋️', description: '' },
          { value: '1_2_week', label: '1-2 ggr/vecka', icon: '🚶', description: '' },
          { value: '3_4_week', label: '3-4 ggr/vecka', icon: '🏃', description: '' },
          { value: 'daily', label: 'Dagligen', icon: '💪', description: '' }
        ]
      },
      {
        id: 'current_routine',
        text: 'Hur ser din nuvarande hudvårdsrutin ut?',
        type: 'single',
        options: [
          { value: 'none', label: 'Ingen rutin', icon: '🚫', description: 'Använder sällan hudvård' },
          { value: 'basic', label: 'Enkel', icon: '💧', description: 'Rengöring och fukt' },
          { value: 'moderate', label: 'Måttlig', icon: '🧴', description: '3-4 produkter' },
          { value: 'extensive', label: 'Omfattande', icon: '🧪', description: '5+ produkter' }
        ]
      },
      {
        id: 'environmental_factors',
        text: 'Vilken typ av miljö befinner du dig mest i?',
        type: 'single',
        options: [
          { value: 'urban', label: 'Stadsmiljö', icon: '🏙️', description: 'Föroreningar och stress' },
          { value: 'suburban', label: 'Förort', icon: '🏘️', description: 'Balanserad miljö' },
          { value: 'rural', label: 'Landsbygd', icon: '🌳', description: 'Ren luft och natur' },
          { value: 'mixed', label: 'Blandat', icon: '🗺️', description: 'Reser mycket' }
        ]
      }
    ]

    // Add gender-specific questions
    if (info.gender === 'female') {
      baseQuestions.push({
        id: 'hormonal_factors',
        text: 'Upplever du hormonella förändringar som påverkar din hud?',
        type: 'single',
        options: [
          { value: 'menstrual', label: 'Menstruationscykel', icon: '🌙', description: '' },
          { value: 'pregnancy', label: 'Graviditet', icon: '🤰', description: '' },
          { value: 'menopause', label: 'Klimakteriet', icon: '🦋', description: '' },
          { value: 'none', label: 'Inga märkbara', icon: '✨', description: '' }
        ]
      })
    }

    // Add age-specific questions
    if (parseInt(info.age) < 25) {
      baseQuestions.push({
        id: 'acne_severity',
        text: 'Hur allvarlig är din akne?',
        type: 'single',
        options: [
          { value: 'none', label: 'Ingen akne', icon: '✨', description: '' },
          { value: 'mild', label: 'Mild', icon: '🟡', description: 'Enstaka finnar' },
          { value: 'moderate', label: 'Måttlig', icon: '🟠', description: 'Regelbundna utbrott' },
          { value: 'severe', label: 'Svår', icon: '🔴', description: 'Omfattande problem' }
        ]
      })
    } else if (parseInt(info.age) > 40) {
      baseQuestions.push({
        id: 'aging_concerns',
        text: 'Vilka åldrande hudproblem oroar dig mest?',
        type: 'multiple',
        options: [
          { value: 'wrinkles', label: 'Rynkor', icon: '〰️', description: '' },
          { value: 'sagging', label: 'Slapphet', icon: '📉', description: '' },
          { value: 'spots', label: 'Åldersfläckar', icon: '🟤', description: '' },
          { value: 'dullness', label: 'Glansloshet', icon: '☁️', description: '' }
        ]
      })
    }

    return baseQuestions
  }

  const handleAnswer = (questionId: string, value: any) => {
    const question = questions[currentQuestion]
    
    if (question.type === 'multiple') {
      const currentAnswers = answers[questionId] || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v: string) => v !== value)
        : [...currentAnswers, value]
      
      setAnswers({ ...answers, [questionId]: newAnswers })
    } else {
      setAnswers({ ...answers, [questionId]: value })
      
      // Auto-advance for single select
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
      }
    }
  }

  const handleQuizComplete = async () => {
    setCurrentStep('loading')
    
    // Simulate loading progress
    const duration = 3000
    const interval = 50
    const increment = 100 / (duration / interval)
    
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(timer)
          calculateResults()
        }
        return Math.min(newProgress, 100)
      })
    }, interval)
  }

  const calculateResults = async () => {
    try {
      // Save to database first
      const saveResponse = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers,
          timestamp: new Date().toISOString()
        })
      })

      // Get AI recommendations
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers
        })
      })

      const data = await response.json()
      setResults(data)
      setCurrentStep('results')
    } catch (error) {
      console.error('Error:', error)
      // Fallback results
      setResults({
        summary: 'Vi har analyserat dina svar',
        recommendations: []
      })
      setCurrentStep('results')
    }
  }

  const progress = currentStep === 'questions' 
    ? ((currentQuestion + 1) / questions.length) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F3F0]">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #8B6B47 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, #4A3428 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, #6B5337 0%, transparent 50%)`
        }} />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/1753.png"
              alt="1753 Skincare"
              width={100}
              height={33}
              className="h-8 w-auto"
            />
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              <span>Tillbaka till startsida</span>
            </div>
          </Link>
          
          {currentStep === 'questions' && (
            <div className="text-sm text-gray-600">
              Fråga {currentQuestion + 1} av {questions.length}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {/* Welcome Screen */}
          {currentStep === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <CloudShape className="inline-block mb-8">
                <Sparkles className="w-16 h-16 text-[#8B6B47] mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                  Välkommen till din hudresa
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  Få personliga rekommendationer baserade på din unika hud, 
                  livsstil och behov - helt naturligt och holistiskt.
                </p>
              </CloudShape>

              <motion.button
                onClick={() => setCurrentStep('userInfo')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#4A3428] text-white rounded-full text-lg font-medium hover:bg-[#3A2418] transition-colors shadow-lg"
              >
                Börja min hudanalys
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  10-14 frågor
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-driven analys
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  100% säker
                </span>
              </div>
            </motion.div>
          )}

          {/* User Info Screen */}
          {currentStep === 'userInfo' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CloudShape className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">
                  Låt oss lära känna dig
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      E-postadress
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="din@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      Namn
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="Ditt namn"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Heart className="w-4 h-4" />
                      Kön
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'female', label: 'Kvinna', icon: '👩', description: '' },
                        { value: 'male', label: 'Man', icon: '👨', description: '' },
                        { value: 'other', label: 'Vill ej ange', icon: '🌟', description: '' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setUserInfo({ ...userInfo, gender: option.value as any })}
                          className={`p-3 rounded-xl border transition-all ${
                            userInfo.gender === option.value
                              ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                              : 'border-gray-200 hover:border-[#8B6B47]/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Ålder
                    </label>
                    <input
                      type="number"
                      value={userInfo.age}
                      onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.age ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="Din ålder"
                      min="15"
                      max="100"
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                    )}
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#8B6B47] rounded focus:ring-[#8B6B47]"
                    />
                    <span className="text-sm text-gray-600">
                      Jag godkänner{' '}
                      <Link href="/integritetspolicy" className="text-[#8B6B47] underline">
                        integritetspolicyn
                      </Link>{' '}
                      och samtycker till att mina svar sparas för att ge mig personliga rekommendationer
                    </span>
                  </label>
                  {errors.privacy && (
                    <p className="text-red-500 text-sm">{errors.privacy}</p>
                  )}

                  {/* Submit */}
                  <motion.button
                    onClick={handleUserInfoSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-[#4A3428] text-white rounded-xl font-medium hover:bg-[#3A2418] transition-colors"
                  >
                    Fortsätt till frågorna
                  </motion.button>
                </div>
              </CloudShape>
            </motion.div>
          )}

          {/* Questions */}
          {currentStep === 'questions' && questions.length > 0 && (
            <div>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#8B6B47] to-[#4A3428]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CloudShape className="max-w-3xl mx-auto">
                    <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-6 text-center">
                      {questions[currentQuestion].text}
                    </h3>

                    <div className="grid gap-3">
                      {questions[currentQuestion].options.map((option: any) => {
                        const isSelected = questions[currentQuestion].type === 'multiple'
                          ? (answers[questions[currentQuestion].id] || []).includes(option.value)
                          : answers[questions[currentQuestion].id] === option.value

                        return (
                          <motion.button
                            key={option.value}
                            onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border transition-all text-left ${
                              isSelected
                                ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                                : 'border-gray-200 hover:border-[#8B6B47]/50 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{option.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-[#8B6B47]" />
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => currentQuestion > 0 ? setCurrentQuestion(currentQuestion - 1) : setCurrentStep('userInfo')}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#8B6B47] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Tillbaka
                      </button>

                      {questions[currentQuestion].type === 'multiple' && (
                        <button
                          onClick={() => {
                            if (currentQuestion < questions.length - 1) {
                              setCurrentQuestion(currentQuestion + 1)
                            } else {
                              handleQuizComplete()
                            }
                          }}
                          disabled={!answers[questions[currentQuestion].id] || answers[questions[currentQuestion].id].length === 0}
                          className="flex items-center gap-2 px-6 py-2 bg-[#4A3428] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentQuestion === questions.length - 1 ? 'Få resultat' : 'Nästa'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CloudShape>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Loading */}
          {currentStep === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <CloudShape className="inline-block">
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#8B6B47"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadingProgress / 100)}`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-light text-gray-900">
                      {Math.round(loadingProgress)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">
                  Analyserar dina svar...
                </h3>
                <p className="text-gray-600">
                  Vår AI skapar dina personliga rekommendationer
                </p>
              </CloudShape>
            </motion.div>
          )}

          {/* Results */}
          {currentStep === 'results' && results && (
            <ImprovedQuizResults results={results} userInfo={userInfo} />
          )}
        </div>
      </div>
    </div>
  )
} 