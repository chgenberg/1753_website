'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Heart, Droplets, Leaf, Brain, MessageCircle, 
  CheckCircle, ArrowRight, ShoppingBag, Sun, Moon, 
  Award, Target, Users, Send, User, Loader, 
  Shield, Star, TrendingUp, Activity, Coffee,
  Smile, CloudRain, Wind, Dumbbell, Apple,
  Clock, BrainCircuit, Lightbulb, ChevronRight,
  Calendar, Zap, BookOpen, Utensils, Home
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterModal } from '@/components/auth/RegisterModal'

interface QuizResultsProps {
  answers: Record<string, string>
  userName?: string
  userEmail?: string
  results?: any
  onRestart?: () => void
  onClose?: () => void
}

type TabType = 'summary' | 'timeline' | 'lifestyle' | 'products' | 'nutrition' | 'sources'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function QuizResults({ answers, userName = '', userEmail = '', results, onRestart, onClose }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(true)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  useEffect(() => {
    // Generate comprehensive AI plan
    generateComprehensivePlan()
  }, [])

  const generateComprehensivePlan = async () => {
    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          name: userName,
          email: userEmail,
          detailed: true
        }),
      })
      const data = await response.json()
      setGeneratedPlan(data)
      setIsGeneratingPlan(false)
    } catch (error) {
      console.error('Error generating plan:', error)
      // Fallback plan
      setGeneratedPlan({
        summary: generateDefaultSummary(),
        timeline: generateDefaultTimeline(),
        lifestyle: generateDefaultLifestyle(),
        products: generateDefaultProducts(),
        nutrition: generateDefaultNutrition(),
        sources: generateDefaultSources()
      })
      setIsGeneratingPlan(false)
    }
  }

  const generateDefaultSummary = () => ({
    greeting: `Hej ${userName}!`,
    overview: 'Baserat på din hudanalys har jag skapat en skräddarsydd plan för dig.',
    skinScore: 70,
    mainConcerns: ['Rodnad och irritation', 'Torrhet', 'Fina linjer'],
    keyRecommendations: [
      'Fokusera på återfuktning och barriärstärkande',
      'Använd milda, lugnande ingredienser',
      'Bygg upp en konsekvent rutin'
    ]
  })

  const generateDefaultTimeline = () => ([
    { 
      week: 'Idag', 
      milestone: 'Start av din hudresa',
      description: 'Börja med basrutinen och dokumentera din hud',
      icon: '🌟'
    },
    { 
      week: 'Vecka 1-2', 
      milestone: 'Anpassningsfas',
      description: 'Din hud vänjer sig vid de nya produkterna',
      icon: '🌱'
    },
    { 
      week: 'Vecka 3-4', 
      milestone: 'Första förbättringarna',
      description: 'Minskad rodnad och jämnare hudton',
      icon: '📈'
    },
    { 
      week: '2 månader', 
      milestone: 'Synlig förändring',
      description: 'Starkare hudbarriär och ökad lyster',
      icon: '✨'
    },
    { 
      week: '3 månader', 
      milestone: 'Bättre hudhälsa!',
      description: 'Balanserad, strålande och frisk hud',
      icon: '🎯'
    }
  ])

  const generateDefaultLifestyle = () => ({
    sleep: {
      recommendation: '7-9 timmar kvalitetssömn',
      tips: [
        'Sov på silkesörngott för mindre friktion',
        'Håll sovrummet svalt (16-19°C)',
        'Undvik skärmar 1 timme före sömn'
      ]
    },
    stress: {
      recommendation: 'Daglig stresshantering',
      tips: [
        '10 minuters meditation varje morgon',
        'Djupandningsövningar vid stress',
        'Regelbunden fysisk aktivitet'
      ]
    },
    exercise: {
      recommendation: '30 min rörelse dagligen',
      tips: [
        'Rengör alltid huden efter träning',
        'Välj andningsbara träningskläder',
        'Fokusera på lågintensiv träning'
      ]
    }
  })

  const generateDefaultProducts = () => ({
    morning: [
      {
        step: 1,
        action: 'Skölj ansiktet med ljummet vatten',
        icon: '💧'
      },
      {
        step: 2,
        action: 'Applicera 3-4 droppar The ONE Facial Oil',
        product: 'the-one-facial-oil',
        icon: '✨'
      },
      {
        step: 3,
        action: 'Följ upp med 1-2 pump TA-DA Serum',
        product: 'ta-da-serum',
        icon: '🌟'
      },
      {
        step: 4,
        action: 'Ta 2 kapslar Fungtastic Mushroom Extract',
        product: 'fungtastic-mushroom-extract',
        icon: '🍄'
      }
    ],
    evening: [
      {
        step: 1,
        action: 'Rengör huden med Au Naturel Makeup Remover',
        product: 'au-naturel-makeup-remover',
        icon: '🧼'
      },
      {
        step: 2,
        action: 'Applicera 3-4 droppar I LOVE Facial Oil',
        product: 'i-love-facial-oil',
        icon: '❤️'
      },
      {
        step: 3,
        action: 'Avsluta med 1-2 pump TA-DA Serum',
        product: 'ta-da-serum',
        icon: '🌙'
      }
    ]
  })

  const generateDefaultNutrition = () => ({
    principles: 'Functional Foods & Paleo-inspirerad kost',
    keyFoods: [
      {
        category: 'Omega-3 rika livsmedel',
        foods: ['Vildfångad lax', 'Sardiner', 'Valnötter', 'Chiafrön'],
        benefit: 'Minskar inflammation och stärker hudbarriären'
      },
      {
        category: 'Antioxidanter',
        foods: ['Blåbär', 'Goji-bär', 'Mörk choklad (85%+)', 'Grönt te'],
        benefit: 'Skyddar mot fria radikaler och för tidigt åldrande'
      },
      {
        category: 'Kollagenbyggande',
        foods: ['Benbuljong', 'Vitamin C-rika frukter', 'Äggulor', 'Avokado'],
        benefit: 'Stödjer hudens elasticitet och fasthet'
      },
      {
        category: 'Probiotika',
        foods: ['Kimchi', 'Sauerkraut', 'Kefir', 'Kombucha'],
        benefit: 'Balanserar tarmfloran som påverkar hudhälsan'
      }
    ],
    mealPlan: {
      breakfast: 'Smoothie med blåbär, spenat, MCT-olja och kollagenpulver',
      lunch: 'Laxsallad med avokado, valnötter och olivolja',
      dinner: 'Gräsbeteskött med fermenterade grönsaker och sötpotatis',
      snacks: 'Mandlar, mörk choklad, grönt te'
    }
  })

  const generateDefaultSources = () => ([
    {
      title: 'The Role of Diet in Maintaining Skin Health',
      journal: 'Journal of Clinical and Aesthetic Dermatology',
      year: '2021',
      link: '#'
    },
    {
      title: 'Omega-3 Fatty Acids and Skin Health',
      journal: 'Nutrients',
      year: '2020',
      link: '#'
    },
    {
      title: 'Probiotics and Skin Health',
      journal: 'Dermatology Online Journal',
      year: '2022',
      link: '#'
    }
  ])

  const tabs = [
    { id: 'summary', label: 'Översikt', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'timeline', label: 'Tidslinje', icon: <Calendar className="w-4 h-4" /> },
    { id: 'lifestyle', label: 'Livsstil', icon: <Heart className="w-4 h-4" /> },
    { id: 'products', label: 'Produkter', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'nutrition', label: 'Kost', icon: <Apple className="w-4 h-4" /> },
    { id: 'sources', label: 'Källor', icon: <BookOpen className="w-4 h-4" /> }
  ]

  if (isGeneratingPlan) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">Skapar din personliga plan...</h2>
          <p className="text-gray-600">Vår AI analyserar dina svar för bästa möjliga resultat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <iframe
            src="https://player.vimeo.com/video/708614911?h=0&background=1&loop=1&badge=0&autopause=0&player_id=0&app_id=58479"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo and Back to Home - Fixed position for desktop */}
        <div className="fixed top-4 left-4 z-30 flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/1753.png"
              alt="1753 Skincare"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Link 
            href="/" 
            className="hidden md:flex items-center gap-2 text-sm text-[#8B6B47] hover:text-[#6B5337] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Tillbaka till startsida</span>
          </Link>
        </div>
        
        {/* Mobile Back Button */}
        <div className="md:hidden absolute top-4 right-4 z-30">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm text-[#8B6B47] hover:text-[#6B5337] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Hem</span>
          </Link>
        </div>

        {/* Header with Skin Score */}
        <div className="bg-white/90 backdrop-blur-sm border-b mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Skin Score Circle */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center mb-4"
            >
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5DDD5"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#8B6B47"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - (generatedPlan?.summary?.skinScore || 70) / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-4xl font-light text-[#8B6B47]"
                  >
                    {generatedPlan?.summary?.skinScore || 70}
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xs text-gray-500 uppercase tracking-wider"
                  >
                    hudpoäng
                  </motion.div>
                </div>
              </div>
              
              {/* Score Description */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-center mt-4 max-w-md"
              >
                <p className="text-sm text-gray-600">
                  {generatedPlan?.summary?.skinScore >= 80 
                    ? "Utmärkt! Din hud är i mycket god kondition med minimal obalans."
                    : generatedPlan?.summary?.skinScore >= 60
                    ? "Bra! Din hud har potential för förbättring med rätt rutiner."
                    : generatedPlan?.summary?.skinScore >= 40
                    ? "Din hud behöver extra omsorg för att återställa balansen."
                    : "Din hud kräver omfattande vård för att återfå optimal hälsa."}
                </p>
              </motion.div>
            </motion.div>
            
            <div className="text-center">
              <h1 className="text-2xl font-light text-gray-900">
                {generatedPlan?.summary?.greeting || `Hej ${userName}!`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Din personliga hudvårdsplan är klar</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[#8B6B47] border-b-2 border-[#8B6B47]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Save Results Button - moved to the right */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRegisterModal(true)}
                className="ml-4 px-6 py-2 bg-[#8B6B47] text-white rounded-full text-sm font-medium hover:bg-[#6B5337] transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Spara resultat
              </motion.button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Overview Card */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">Din hudanalys</h2>
                    <p className="text-gray-600 mb-6">
                      {generatedPlan?.summary?.overview || 'Baserat på din hudanalys har jag skapat en skräddarsydd plan för dig.'}
                    </p>
                    
                    {/* Main Concerns */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Fokusområden</h3>
                      <div className="flex flex-wrap gap-2">
                        {(generatedPlan?.summary?.mainConcerns || ['Rodnad', 'Torrhet', 'Fina linjer']).map((concern: string, index: number) => (
                          <span key={index} className="px-4 py-2 bg-[#8B6B47]/10 text-[#8B6B47] rounded-full text-sm">
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Recommendations */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Nyckelrekommendationer</h3>
                      <ul className="space-y-2">
                        {(generatedPlan?.summary?.keyRecommendations || [
                          'Fokusera på återfuktning och barriärstärkande',
                          'Använd milda, lugnande ingredienser',
                          'Bygg upp en konsekvent rutin'
                        ]).map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-medium text-gray-900 mb-6">Din hudresa - steg för steg</h2>
                    
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#8B6B47] to-transparent" />
                      
                      {/* Timeline Items */}
                      <div className="space-y-8">
                        {(generatedPlan?.timeline || generateDefaultTimeline()).map((item: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-6"
                          >
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full flex items-center justify-center text-2xl shadow-lg">
                                {item.icon}
                              </div>
                              {index < 4 && (
                                <div className="absolute top-16 left-8 h-full w-0.5 bg-gradient-to-b from-[#8B6B47]/30 to-transparent" />
                              )}
                            </div>
                            
                            <div className="flex-1 pb-8">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">{item.week}</h3>
                              <p className="text-[#8B6B47] font-medium mb-2">{item.milestone}</p>
                              <p className="text-gray-600">{item.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'lifestyle' && (
                <motion.div
                  key="lifestyle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Sleep */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Moon className="w-6 h-6 text-[#8B6B47]" />
                      <h3 className="text-xl font-medium text-gray-900">Sömn</h3>
                    </div>
                    <p className="text-lg text-[#8B6B47] font-medium mb-4">
                      {generatedPlan?.lifestyle?.sleep?.recommendation || '7-9 timmar kvalitetssömn'}
                    </p>
                    <ul className="space-y-2">
                      {(generatedPlan?.lifestyle?.sleep?.tips || generateDefaultLifestyle().sleep.tips).map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stress */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-6 h-6 text-[#8B6B47]" />
                      <h3 className="text-xl font-medium text-gray-900">Stresshantering</h3>
                    </div>
                    <p className="text-lg text-[#8B6B47] font-medium mb-4">
                      {generatedPlan?.lifestyle?.stress?.recommendation || 'Daglig stresshantering'}
                    </p>
                    <ul className="space-y-2">
                      {(generatedPlan?.lifestyle?.stress?.tips || generateDefaultLifestyle().stress.tips).map((tip: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exercise */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-[#8B6B47]" />
                      <h3 className="text-xl font-medium text-gray-900">Träning</h3>
                    </div>
                    <p className="text-lg text-[#8B6B47] font-medium mb-4">
                      {generatedPlan?.lifestyle?.exercise?.recommendation || '30 min rörelse dagligen'}
                    </p>
                    <ul className="space-y-2">
                      {(generatedPlan?.lifestyle?.exercise?.tips || generateDefaultLifestyle().exercise.tips).map((tip: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Morning Routine */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Sun className="w-6 h-6 text-[#8B6B47]" />
                      <h3 className="text-xl font-medium text-gray-900">Morgonrutin</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {(generatedPlan?.products?.morning || generateDefaultProducts().morning).map((step: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">Steg {step.step}</p>
                            <p className="text-gray-600">{step.action}</p>
                          </div>
                          {step.product && (
                            <Link
                              href={`/products/${step.product}`}
                              className="px-4 py-2 bg-[#8B6B47] text-white rounded-full text-sm hover:bg-[#6B5337] transition-colors"
                            >
                              Se produkt
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Evening Routine */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Moon className="w-6 h-6 text-[#8B6B47]" />
                      <h3 className="text-xl font-medium text-gray-900">Kvällsrutin</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {(generatedPlan?.products?.evening || generateDefaultProducts().evening).map((step: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">Steg {step.step}</p>
                            <p className="text-gray-600">{step.action}</p>
                          </div>
                          {step.product && (
                            <Link
                              href={`/products/${step.product}`}
                              className="px-4 py-2 bg-[#8B6B47] text-white rounded-full text-sm hover:bg-[#6B5337] transition-colors"
                            >
                              Se produkt
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Principles */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 mb-4">Kostprinciper</h3>
                    <p className="text-lg text-[#8B6B47] font-medium">
                      {generatedPlan?.nutrition?.principles || 'Functional Foods & Paleo-inspirerad kost'}
                    </p>
                  </div>

                  {/* Key Foods */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 mb-6">Nyckellivsmedel för din hud</h3>
                    
                    <div className="space-y-6">
                      {(generatedPlan?.nutrition?.keyFoods || generateDefaultNutrition().keyFoods).map((category: any, index: number) => (
                        <div key={index}>
                          <h4 className="font-medium text-[#8B6B47] mb-2">{category.category}</h4>
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-2">
                              {category.foods.map((food: any, foodIndex: number) => (
                                <span key={foodIndex} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">{category.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 mb-6">Exempel på dagsmeny</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(generatedPlan?.nutrition?.mealPlan || generateDefaultNutrition().mealPlan).map(([meal, description]: [string, any]) => (
                        <div key={meal} className="flex gap-4">
                          <div className="w-24 text-sm font-medium text-gray-500 capitalize">{meal}:</div>
                          <div className="flex-1 text-gray-700">{description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sources' && (
                <motion.div
                  key="sources"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 mb-6">Vetenskapliga källor</h3>
                    
                    <div className="space-y-4">
                      {(generatedPlan?.sources || generateDefaultSources()).map((source: any, index: number) => (
                        <div key={index} className="border-l-4 border-[#8B6B47] pl-4">
                          <h4 className="font-medium text-gray-900">{source.title}</h4>
                          <p className="text-sm text-gray-600">
                            {source.journal} • {source.year}
                          </p>
                          {source.link && (
                            <a href={source.link} className="text-sm text-[#8B6B47] hover:underline">
                              Läs mer →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 