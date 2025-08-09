'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Calendar, Check, ChevronRight, ChevronLeft, 
  Sparkles, Heart, Sun, Moon, Droplets, Leaf, Timer, 
  AlertCircle, Shield, Home, Info
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ImprovedQuizResults from '@/components/quiz/ImprovedQuizResults'
import { LoadingAnimation } from '@/components/quiz/LoadingAnimation'
import FacePhotoAnalyzer, { ImageMetricsResult } from '@/components/quiz/FacePhotoAnalyzer'
import confetti from 'canvas-confetti'

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

// Animated subtle background orbs
const AnimatedOrbs = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#8B6B47]/20 blur-3xl"
      animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0], opacity: [0.6, 0.8, 0.7, 0.6] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#4A3428]/10 blur-3xl"
      animate={{ x: [0, -30, 10, 0], y: [0, -15, 25, 0], opacity: [0.5, 0.65, 0.55, 0.5] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
)

// Accessible hint tooltip
function HintPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={text}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Info className="w-4 h-4 text-gray-500" />
      </button>
      {open && (
        <div role="tooltip" className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 text-xs bg-white border border-gray-200 shadow-md rounded p-2 z-10">
          {text}
        </div>
      )}
    </span>
  )
}

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
      if (!raw) return setResumePrompt(false)
      const data = JSON.parse(raw)
      setUserInfo(data.userInfo || userInfo)
      setPrivacyAccepted(!!data.privacyAccepted)
      setQuestions(data.questions || [])
      setAnswers(data.answers || {})
      setCurrentQuestion(typeof data.currentQuestion === 'number' ? data.currentQuestion : 0)
      setCurrentStep(data.currentStep || 'welcome')
    } catch {}
    setResumePrompt(false)
  }

  const discardStorage = () => {
    try { localStorage.removeItem('quizProgress') } catch {}
    setResumePrompt(false)
  }

  // Auto-save progress (with consent)
  useEffect(() => {
    if (!privacyAccepted) return
    const payload = {
      currentStep,
      userInfo,
      privacyAccepted,
      currentQuestion,
      answers,
      questions
    }
    try { localStorage.setItem('quizProgress', JSON.stringify(payload)) } catch {}
  }, [currentStep, userInfo, privacyAccepted, currentQuestion, answers, questions])

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
    setCurrentStep('photo')
  }

  const loadQuestionsForUser = () => {
    // This would load dynamic questions based on gender and age
    // For now, using a base set
    setQuestions(getQuestionsForUser(userInfo))
  }

  const getQuestionsForUser = (info: UserInfo) => {
    const hints: Record<string, string> = {
      skin_type: 'Om du är osäker, välj Osäker så kalibrerar vi i resultatet.',
      skin_concerns: 'Välj 1–3 viktigaste områden att fokusera på först.',
      lifestyle_stress: 'Stress påverkar hudens lyster och inflammation.',
      sleep_quality: 'Sömn är kroppens reparationsfönster för huden.',
      water_intake: 'Hudbarriären mår bättre vid jämn vätskenivå.',
      sun_exposure: 'Gradvis exponering bygger tolerans – undvik rodnad.',
      diet_quality: 'Hel och obearbetad mat gynnar tarm-hud-axeln.',
      exercise_frequency: 'Rörelse ökar cirkulation och stödjer hudens läkning.',
      current_routine: 'Vi anpassar rekommendationer utifrån din nivå.',
      environmental_factors: 'Miljön påverkar behovet av skyddande strategier.'
    }

    // Base questions that everyone gets
    const baseQuestions = [
      {
        id: 'skin_type',
        text: 'Hur skulle du beskriva din hudtyp?',
        hint: hints.skin_type,
        type: 'single',
        options: [
          { value: 'dry', label: 'Torr', icon: '🏜️', description: 'Känns stram och kan fjälla' },
          { value: 'oily', label: 'Oljig', icon: '💧', description: 'Glansig, särskilt i T-zonen' },
          { value: 'combination', label: 'Kombinerad', icon: '🎭', description: 'Torr på vissa ställen, oljig på andra' },
          { value: 'normal', label: 'Normal', icon: '✨', description: 'Välbalanserad utan större problem' },
          { value: 'sensitive', label: 'Känslig', icon: '🌸', description: 'Reagerar lätt på produkter' },
          { value: 'not_sure', label: 'Osäker', icon: '❓', description: 'Jag vet inte / svårt att säga' }
        ]
      },
      {
        id: 'skin_concerns',
        text: 'Vilka hudproblem vill du främst adressera?',
        hint: hints.skin_concerns,
        type: 'multiple',
        options: [
          { value: 'acne', label: 'Akne', icon: '🔴', description: 'Utbrott, finnar' },
          { value: 'aging', label: 'Åldrande', icon: '⏰', description: 'Rynkor, fasthet' },
          { value: 'pigmentation', label: 'Pigmentering', icon: '🎨', description: 'Fläckar, ojämn ton' },
          { value: 'redness', label: 'Rodnad', icon: '🌹', description: 'Känslighet, reaktivitet' },
          { value: 'dryness', label: 'Torrhet', icon: '🏜️', description: 'Stram, flagnande' },
          { value: 'oiliness', label: 'Oljighet', icon: '💧', description: 'Glans, utvidgade porer' },
          { value: 'sensitivity', label: 'Känslighet', icon: '🌸', description: 'Reagerar lätt' },
          { value: 'texture', label: 'Ojämn hudstruktur', icon: '🏔️', description: 'Knottror, förtjockning' }
        ]
      },
      {
        id: 'lifestyle_stress',
        text: 'Hur skulle du beskriva din stressnivå i vardagen?',
        hint: hints.lifestyle_stress,
        type: 'single',
        options: [
          { value: 'low', label: 'Låg', icon: '😌', description: 'Oftast lugn' },
          { value: 'moderate', label: 'Måttlig', icon: '😐', description: 'Hanterbar stress' },
          { value: 'high', label: 'Hög', icon: '😰', description: 'Ofta stressad' },
          { value: 'very_high', label: 'Mycket hög', icon: '😣', description: 'Påverkar välmående' }
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
          { value: 'none', label: 'Inga märkbara', icon: '✨', description: '' },
          { value: 'not_sure', label: 'Osäker', icon: '❓', description: '' }
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
          { value: 'severe', label: 'Svår', icon: '🔴', description: 'Omfattande problem' },
          { value: 'not_sure', label: 'Osäker', icon: '❓', description: '' }
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
      // update activedescendant for a11y
      setActiveDescendantId(`opt-${questionId}-${value}`)
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
      }
    }
  }

  // Helper: option label lookup and mini summary
  const getOptionLabel = (qid: string, val: string) => {
    const q = questions.find((x) => x.id === qid)
    const o = q?.options?.find((op: any) => op.value === val)
    return o?.label || val
  }
  const miniSummary = () => {
    const parts: string[] = []
    if (answers.skin_type) parts.push(`Hudtyp: ${getOptionLabel('skin_type', answers.skin_type)}`)
    if (Array.isArray(answers.skin_concerns) && answers.skin_concerns.length) {
      const labels = answers.skin_concerns.slice(0, 3).map((v: string) => getOptionLabel('skin_concerns', v))
      parts.push(`Fokus: ${labels.join(', ')}`)
    }
    return parts.join(' · ')
  }

  // Keyboard shortcuts: 1-9 for options, Backspace to go back, Enter to continue for multiple
  const onRadioGroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const q = questions[currentQuestion]
    if (!q) return

    // Numeric selection
    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1
      const opt = q.options[idx]
      if (opt) {
        e.preventDefault()
        handleAnswer(q.id, opt.value)
        return
      }
    }

    if (q.type === 'single') {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Backspace') return
      e.preventDefault()
      if (e.key === 'Backspace') {
        if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
        return
      }
      const opts = q.options
      const currentVal = answers[q.id]
      const idx = Math.max(0, opts.findIndex((o: any) => o.value === currentVal))
      const nextIdx = e.key === 'ArrowRight' ? Math.min(idx + 1, opts.length - 1) : Math.max(idx - 1, 0)
      const nextVal = opts[nextIdx]?.value
      if (nextVal != null) handleAnswer(q.id, nextVal)
    } else {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
        else setCurrentStep('review')
      }
    }
  }

  const handleNextFromMultiple = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCurrentStep('review')
    }
  }

  const handleQuizComplete = async () => {
    setCurrentStep('loading')
    
    // Start loading with 45 second duration
    const duration = 45000 // 45 seconds
    const interval = 100 // Update every 100ms for smooth animation
    const increment = 100 / (duration / interval)
    
    // Start the API calls immediately
    calculateResults()
    
    // Animate the progress bar over 45 seconds
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(timer)
          return 100
        }
        return newProgress
      })
    }, interval)
  }

  const calculateResults = async () => {
    try {
      console.log('Starting quiz submission...')
      
      // Save to database first
      console.log('Saving quiz data...')
      const saveResponse = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers,
          imageMetrics, // include metrics snapshot
          timestamp: new Date().toISOString()
        })
      })

      console.log('Save response status:', saveResponse.status)
      console.log('Save response headers:', saveResponse.headers)
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error('Save API error:', errorText)
        throw new Error(`Save failed: ${saveResponse.status} - ${errorText}`)
      }

      const saveData = await saveResponse.json()
      console.log('Save successful:', saveData)

      // Get AI recommendations
      console.log('Getting AI recommendations...')
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers,
          imageMetrics
        })
      })

      console.log('Results response status:', response.status)
      console.log('Results response headers:', response.headers)
      console.log('Results response URL:', response.url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Results API error:', errorText)
        throw new Error(`Results failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Results successful:', data)
      
      setResults(data)
      setCurrentStep('results')
    } catch (error) {
      console.error('Quiz calculation error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('Current location:', window.location.href)
      
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

  const remaining = currentStep === 'questions' ? Math.max(questions.length - (currentQuestion + 1), 0) : 0
  const etaSeconds = remaining * 7
  const etaMinutes = Math.floor(etaSeconds / 60)
  const etaRemainder = etaSeconds % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F3F0]">
      <AnimatedOrbs />
      {/* Resume prompt */}
      {resumePrompt && (
        <div className="fixed top-0 inset-x-0 z-30 bg-amber-50 border-b border-amber-200 text-amber-900">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-sm">
            <span>Fortsätt där du slutade?</span>
            <div className="flex gap-2">
              <button onClick={resumeFromStorage} className="px-3 py-1 rounded bg-amber-600 text-white">Fortsätt</button>
              <button onClick={discardStorage} className="px-3 py-1 rounded border border-amber-300">Nej tack</button>
            </div>
          </div>
        </div>
      )}
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
            <div className="text-xs md:text-sm text-gray-600 flex items-center gap-3">
              <span>Fråga {currentQuestion + 1} av {questions.length}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>ETA ~ {etaMinutes}:{etaRemainder.toString().padStart(2,'0')}</span>
              {miniSummary() && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:inline-block" />
                  <span className="hidden md:inline text-gray-500">{miniSummary()}</span>
                </>
              )}
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
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-gray-100">Snabbt: 10–14 frågor</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100">AI-stödd analys</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100">Säker och privat</span>
                </div>
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
              {/* Live region for validation messages */}
              <div className="sr-only" aria-live="polite">
                {Object.values(errors).join('. ')}
              </div>
              <CloudShape className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">
                  Låt oss lära känna dig
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2" htmlFor="quiz-email">
                      <Mail className="w-4 h-4" />
                      E-postadress
                    </label>
                    <input
                      id="quiz-email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="din@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'err-email' : undefined}
                    />
                    {errors.email && (
                      <p id="err-email" className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2" htmlFor="quiz-name">
                      <User className="w-4 h-4" />
                      Namn
                    </label>
                    <input
                      id="quiz-name"
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="Ditt namn"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'err-name' : undefined}
                    />
                    {errors.name && (
                      <p id="err-name" className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Heart className="w-4 h-4" />
                      Kön
                    </label>
                    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Välj kön">
                      {[{ value: 'female', label: 'Kvinna', icon: '👩' }, { value: 'male', label: 'Man', icon: '👨' }, { value: 'other', label: 'Vill ej ange', icon: '🌟' }].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setUserInfo({ ...userInfo, gender: option.value as any })}
                          className={`p-3 rounded-xl border transition-all ${
                            userInfo.gender === option.value
                              ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                              : 'border-gray-200 hover:border-[#8B6B47]/50'
                          }`}
                          role="radio"
                          aria-checked={userInfo.gender === option.value}
                        >
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1" id="err-gender">{errors.gender}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2" htmlFor="quiz-age">
                      <Calendar className="w-4 h-4" />
                      Ålder
                    </label>
                    <input
                      id="quiz-age"
                      type="number"
                      value={userInfo.age}
                      onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.age ? 'border-red-400' : 'border-gray-200'
                      } focus:outline-none focus:border-[#8B6B47] transition-colors`}
                      placeholder="Din ålder"
                      min="15"
                      max="100"
                      aria-invalid={!!errors.age}
                      aria-describedby={errors.age ? 'err-age' : undefined}
                    />
                    {errors.age && (
                      <p id="err-age" className="text-red-500 text-sm mt-1">{errors.age}</p>
                    )}
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#8B6B47] rounded focus:ring-[#8B6B47]"
                      aria-describedby={errors.privacy ? 'err-privacy' : undefined}
                    />
                    <span className="text-sm text-gray-600">
                      Jag godkänner <Link href="/integritetspolicy" className="text-[#8B6B47] underline">integritetspolicyn</Link> och samtycker till att mina svar sparas för att ge mig personliga rekommendationer
                    </span>
                  </label>
                  {errors.privacy && (
                    <p id="err-privacy" className="text-red-500 text-sm">{errors.privacy}</p>
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

          {/* Photo upload step */}
          {currentStep === 'photo' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CloudShape className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-light text-gray-900 mb-4 text-center">Valfri fotobaserad analys</h2>
                <p className="text-sm text-gray-600 text-center mb-6">Ladda upp en selfie i neutralt ljus. Vi analyserar fem zoner (panna, kinder, näsa, haka) lokalt på din enhet och använder måtten i din rekommendation.</p>
                <FacePhotoAnalyzer onAnalyze={(m) => setImageMetrics(m)} />
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setCurrentStep('userInfo')} className="text-gray-600 hover:text-[#8B6B47]">Tillbaka</button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentStep('questions')} className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">Hoppa över</button>
                    <button onClick={() => setCurrentStep('questions')} className="px-6 py-2 bg-[#4A3428] text-white rounded-full hover:bg-[#3A2418]">Fortsätt</button>
                  </div>
                </div>
              </CloudShape>
            </motion.div>
          )}

          {/* Questions */}
          {currentStep === 'questions' && questions.length > 0 && (
            <div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#8B6B47] to-[#4A3428]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {/* Progress dots */}
              <div className="mb-6 flex flex-wrap gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => i < currentQuestion ? setCurrentQuestion(i) : null}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i === currentQuestion ? 'bg-[#8B6B47]' : i < currentQuestion ? 'bg-[#8B6B47]/40' : 'bg-gray-200'
                    }`}
                    aria-label={`Gå till fråga ${i + 1}`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CloudShape className="max-w-3xl mx-auto">
                    <h3
                      ref={questionHeadingRef}
                      tabIndex={-1}
                      className="text-xl md:text-2xl font-light text-gray-900 mb-2 text-center flex items-center justify-center gap-2 focus:outline-none"
                    >
                      {questions[currentQuestion].text}
                      {questions[currentQuestion].hint && (
                        <HintPopover text={questions[currentQuestion].hint} />
                      )}
                    </h3>
                    <p className="text-center text-xs text-gray-500 mb-4">Tips: Använd siffrorna 1–9 på tangentbordet för snabbval.</p>

                    <div
                      className="grid md:grid-cols-2 gap-3"
                      role={questions[currentQuestion].type === 'single' ? 'radiogroup' : 'listbox'}
                      aria-multiselectable={questions[currentQuestion].type === 'multiple' ? true : undefined}
                      aria-activedescendant={activeDescendantId}
                      onKeyDown={onRadioGroupKeyDown}
                      tabIndex={0}
                      aria-label="Svarsalternativ"
                    >
                      {questions[currentQuestion].options.map((option: any, idx: number) => {
                        const isSelected = questions[currentQuestion].type === 'multiple'
                          ? (answers[questions[currentQuestion].id] || []).includes(option.value)
                          : answers[questions[currentQuestion].id] === option.value
                        const optId = `opt-${questions[currentQuestion].id}-${option.value}`
                        return (
                          <motion.button
                            key={option.value}
                            id={optId}
                            onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                            whileHover={{ scale: 1.02, rotate: 0.2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative p-4 rounded-xl border transition-all text-left overflow-hidden ${
                              isSelected
                                ? 'border-[#8B6B47] bg-[#8B6B47]/10 shadow'
                                : 'border-gray-200 hover:border-[#8B6B47]/50 bg-white'
                            }`}
                            role={questions[currentQuestion].type === 'single' ? 'radio' : 'option'}
                            aria-checked={questions[currentQuestion].type === 'single' ? isSelected : undefined}
                            aria-selected={questions[currentQuestion].type === 'multiple' ? isSelected : undefined}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#8B6B47]/5 to-transparent" />
                            <div className="flex items-center gap-4 relative">
                              <span className="text-2xl" aria-hidden>{option.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  <span className="mr-2 text-xs text-gray-400">{idx + 1}.</span>
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

                      {questions[currentQuestion].type === 'multiple' ? (
                        <button
                          onClick={handleNextFromMultiple}
                          disabled={!answers[questions[currentQuestion].id] || answers[questions[currentQuestion].id].length === 0}
                          className="flex items-center gap-2 px-6 py-2 bg-[#4A3428] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentQuestion === questions.length - 1 ? 'Granska svar' : 'Nästa'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
                            else setCurrentStep('review')
                          }}
                          className="hidden md:inline-flex items-center gap-2 px-6 py-2 bg-[#4A3428] text-white rounded-full"
                        >
                          {currentQuestion === questions.length - 1 ? 'Granska svar' : 'Nästa'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Save for later */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => { try { localStorage.setItem('quizProgress', JSON.stringify({ currentStep, userInfo, privacyAccepted, currentQuestion, answers, questions })) } catch {} }}
                        className="text-sm text-gray-600 underline hover:text-[#8B6B47]"
                      >
                        Spara och fortsätt senare
                      </button>
                    </div>
                  </CloudShape>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Review */}
          {currentStep === 'review' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CloudShape className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-light text-gray-900 mb-4 text-center">Granska dina svar</h2>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-xl border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Fråga {idx + 1}</div>
                      <div className="font-medium text-gray-900 mb-1">{q.text}</div>
                      <div className="text-sm text-gray-700">
                        {Array.isArray(answers[q.id])
                          ? (answers[q.id] || []).join(', ')
                          : (answers[q.id] ?? '—')}
                      </div>
                      <div className="mt-2">
                        <button onClick={() => { setCurrentStep('questions'); setCurrentQuestion(idx) }} className="text-sm text-[#8B6B47] underline">Ändra</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional photo analysis */}
                <div className="mt-6">
                  <FacePhotoAnalyzer onAnalyze={(m) => setImageMetrics(m)} />
                  {imageMetrics && (
                    <div className="mt-3 text-sm text-gray-600">
                      Bilddata bifogas (konfidens {Math.round(imageMetrics.confidence*100)}%).
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setCurrentStep('questions')} className="flex items-center gap-2 text-gray-600 hover:text-[#8B6B47]">
                    <ChevronLeft className="w-4 h-4" />
                    Tillbaka
                  </button>
                  <button onClick={handleQuizComplete} className="px-6 py-2 bg-[#4A3428] text-white rounded-full hover:bg-[#3A2418]">
                    Bekräfta och visa resultat
                  </button>
                </div>
              </CloudShape>
            </motion.div>
          )}

          {/* Loading */}
          {currentStep === 'loading' && (
            <LoadingAnimation progress={loadingProgress} />
          )}

          {/* Results */}
          {currentStep === 'results' && results && (
            <ImprovedQuizResults results={results} userInfo={userInfo} imageMetrics={imageMetrics} />
          )}
        </div>
      </div>
    </div>
  )
} 