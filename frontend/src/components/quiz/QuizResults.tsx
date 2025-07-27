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
  Calendar, Zap, BookOpen, Utensils, Home, HelpCircle,
  X, Info
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

// Add summary tab component
const SummaryTab = ({ summary }: { summary: any }) => (
  <div className="space-y-6">
    {/* Greeting and Overview */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-2xl font-semibold text-[#8B6B47] mb-4">{summary.greeting}</h3>
      <p className="text-gray-700 leading-relaxed">{summary.overview}</p>
    </div>

    {/* Main Concerns */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#8B6B47]" />
        Dina huvudbekymmer
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summary.mainConcerns?.map((concern: string, index: number) => (
          <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 text-[#8B6B47] flex-shrink-0" />
            <span className="text-gray-700">{concern}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Key Recommendations */}
    <div className="bg-gradient-to-br from-[#8B6B47]/10 to-[#6B5337]/10 rounded-xl p-6 shadow-lg">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-[#8B6B47]" />
        Nyckelrekommendationer
      </h4>
      <ul className="space-y-3">
        {summary.keyRecommendations?.map((rec: string, index: number) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-[#8B6B47] font-semibold mt-0.5">{index + 1}.</span>
            <span className="text-gray-700">{rec}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Unique Insight */}
    {summary.uniqueInsight && (
      <div className="bg-[#8B6B47] text-white rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Unik insikt för dig
        </h4>
        <p className="leading-relaxed">{summary.uniqueInsight}</p>
      </div>
    )}
  </div>
)

export function QuizResults({ answers, userName = '', userEmail = '', results, onRestart, onClose }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(true)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [showScoreExplanation, setShowScoreExplanation] = useState(false)

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
    scoreExplanation: 'Din hudpoäng baseras på dina svar om livsstil, hudvård och hälsa. Högre poäng indikerar bättre förutsättningar för optimal hudhälsa.',
    mainConcerns: ['Rodnad och irritation', 'Torrhet', 'Fina linjer'],
    keyRecommendations: [
      'Fokusera på återfuktning och barriärstärkande',
      'Använd milda, lugnande ingredienser',
      'Bygg upp en konsekvent rutin'
    ],
    uniqueInsight: 'Din kombination av hudtyp och livsstil gör att CBD-baserade produkter kan vara särskilt effektiva för dig.'
  })

  const generateDefaultTimeline = () => ({
    week1: {
      focus: 'Återställ hudens grundbalans',
      morningRoutine: [
        'Mild rengöring med ljummet vatten',
        'Applicera CBD-serum på fuktig hud',
        'Avsluta med SPF 30+'
      ],
      eveningRoutine: [
        'Dubbelrengöring om du använt makeup',
        'Applicera ansiktsolja',
        'Lätt ansiktsmassage'
      ],
      expectedChanges: 'Huden kan genomgå en anpassningsfas',
      tips: ['Dokumentera med foton', 'Drick extra vatten']
    },
    month1: {
      focus: 'Optimera och anpassa',
      routineAdjustments: ['Öka produktmängd vid behov'],
      expectedImprovements: ['Jämnare hudton', 'Minskad inflammation'],
      milestones: ['Huden känns lugnare', 'Mindre rodnad']
    },
    month3: {
      focus: 'Långsiktig optimering',
      advancedTechniques: ['Gua sha', 'Veckovis ansiktsmask'],
      expectedResults: ['Synlig förbättring', 'Stabil hudbalans'],
      maintenancePlan: 'Fortsätt med etablerad rutin'
    }
  })

  const generateDefaultLifestyle = () => ({
    sleep: {
      recommendation: '7-9 timmars sömn per natt',
      importance: 'Under sömn repareras huden',
      tips: ['Sov på silkeskudde', 'Håll sovrummet svalt']
    },
    stress: {
      currentImpact: 'Stress påverkar hudens läkning',
      techniques: ['Meditation', 'Djupandning'],
      dailyPractice: '5 minuters mindfulness'
    },
    exercise: {
      recommendation: '30 min daglig rörelse',
      skinBenefits: 'Ökar blodcirkulation',
      bestTypes: ['Yoga', 'Promenader']
    },
    environment: {
      protection: 'Skydda mot miljöstress',
      seasonalAdjustments: 'Anpassa efter säsong',
      homeEnvironment: ['Luftfuktare', 'Rena sängkläder']
    }
  })

  const generateDefaultProducts = () => ({
    essentials: [
      {
        name: 'DUO-kit',
        why: 'Perfekt för din hudtyp',
        usage: 'Morgon och kväll',
        keyIngredients: ['CBD', 'CBG'],
        expectedResults: 'Mjukare hud inom 7 dagar'
      }
    ],
    advanced: [],
    applicationOrder: ['Rengöring', 'Serum', 'Olja', 'SPF'],
    proTips: ['Värm oljan mellan händerna', 'Tryck in produkter']
  })

  const generateDefaultNutrition = () => ({
    gutSkinAxis: 'Tarmhälsan påverkar direkt din hudhälsa',
    keyFoods: [
      {
        category: 'Omega-3 rika livsmedel',
        foods: ['Vildfångad lax', 'Sardiner', 'Valnötter', 'Chiafrön'],
        benefit: 'Minskar inflammation och stärker hudbarriären',
        servingSuggestion: '2-3 portioner per vecka'
      },
      {
        category: 'Antioxidanter',
        foods: ['Blåbär', 'Goji-bär', 'Mörk choklad (85%+)', 'Grönt te'],
        benefit: 'Skyddar mot fria radikaler och för tidigt åldrande',
        servingSuggestion: 'Dagligen'
      },
      {
        category: 'Kollagenbyggande',
        foods: ['Benbuljong', 'Vitamin C-rika frukter', 'Äggulor', 'Avokado'],
        benefit: 'Stödjer hudens elasticitet och fasthet',
        servingSuggestion: '3-4 gånger per vecka'
      },
      {
        category: 'Probiotika',
        foods: ['Kimchi', 'Sauerkraut', 'Kefir', 'Kombucha'],
        benefit: 'Balanserar tarmfloran som påverkar hudhälsan',
        servingSuggestion: 'En portion dagligen'
      }
    ],
    supplements: [],
    avoidFoods: [],
    mealPlan: {
      breakfast: 'Smoothie med blåbär, spenat, MCT-olja och kollagenpulver',
      lunch: 'Laxsallad med avokado, valnötter och olivolja',
      dinner: 'Gräsbeteskött med fermenterade grönsaker och sötpotatis',
      snacks: ['Mandlar', 'Mörk choklad', 'Grönt te']
    },
    hydration: {
      dailyGoal: '2-3 liter',
      tips: ['Börja dagen med varmt vatten och citron'],
      herbalteas: ['Grönt te', 'Rooibos']
    }
  })

  const generateDefaultSources = () => ({
    scientificBasis: 'Baserad på senaste forskningen inom dermatologi',
    keyStudies: [
      'The endocannabinoid system of the skin',
      'CBD effects on skin health'
    ],
    additionalReading: [],
    expertNote: 'Kom ihåg att hudvård är en resa, inte en destination.'
  })

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
                
                {/* Score Explanation Icon */}
                <button
                  onClick={() => setShowScoreExplanation(true)}
                  className="absolute -right-2 top-0 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
                  aria-label="Förklaring av hudpoäng"
                >
                  <HelpCircle className="w-5 h-5 text-[#8B6B47]" />
                </button>
              </div>
              
              {/* Score Description */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-4 text-center max-w-md"
              >
                <h1 className="text-2xl font-light text-gray-900 mb-2">
                  Din personliga hudvårdsplan
                </h1>
                <p className="text-sm text-gray-600">
                  Baserad på din unika hudprofil och livsstil
                </p>
              </motion.div>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#8B6B47] text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:text-[#8B6B47]'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'summary' && <SummaryTab summary={generatedPlan?.summary || generateDefaultSummary()} />}
                {activeTab === 'timeline' && <TimelineTab timeline={generatedPlan?.timeline || generateDefaultTimeline()} />}
                {activeTab === 'lifestyle' && <LifestyleTab lifestyle={generatedPlan?.lifestyle || generateDefaultLifestyle()} />}
                {activeTab === 'products' && <ProductsTab products={generatedPlan?.products || generateDefaultProducts()} />}
                {activeTab === 'nutrition' && <NutritionTab nutrition={generatedPlan?.nutrition || generateDefaultNutrition()} />}
                {activeTab === 'sources' && <SourcesTab sources={generatedPlan?.sources || generateDefaultSources()} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white/90 backdrop-blur-sm border-t p-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">Vill du ha din plan på mail?</p>
              <p className="text-xs text-gray-500">Få påminnelser och uppföljning</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3 bg-[#8B6B47] text-white rounded-full hover:bg-[#6B5337] transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Skicka till mail
              </button>
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-[#8B6B47] border border-[#8B6B47] rounded-full hover:bg-[#8B6B47] hover:text-white transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Se produkter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Score Explanation Popup */}
      <AnimatePresence>
        {showScoreExplanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowScoreExplanation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Så fungerar hudpoängen</h3>
                <button
                  onClick={() => setShowScoreExplanation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Din hudpoäng ({generatedPlan?.summary?.skinScore || 70}/100) är en helhetsbedömning baserad på:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold">+</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Positiva faktorer</p>
                      <p className="text-sm text-gray-600">God sömn, låg stress, regelbunden träning, bra kost</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-semibold">-</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Negativa faktorer</p>
                      <p className="text-sm text-gray-600">Sömnbrist, hög stress, minimal hudvård, dålig kost</p>
                    </div>
                  </div>
                </div>
                
                {generatedPlan?.summary?.scoreExplanation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Din poäng:</span> {generatedPlan.summary.scoreExplanation}
                    </p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tips:</span> Följ din personliga plan för att höja din hudpoäng över tid!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          initialEmail={userEmail}
          source="quiz_results"
        />
      )}
    </div>
  )
}

// ... existing tab components ...
const TimelineTab = ({ timeline }: { timeline: any }) => (
  <div className="space-y-8">
    {/* Week 1 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Vecka 1: {timeline.week1?.focus}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            Morgonrutin
          </h4>
          <ul className="space-y-2">
            {timeline.week1?.morningRoutine?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#8B6B47] mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-500" />
            Kvällsrutin
          </h4>
          <ul className="space-y-2">
            {timeline.week1?.eveningRoutine?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#8B6B47] mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Förväntat:</span> {timeline.week1?.expectedChanges}
        </p>
      </div>
    </motion.div>

    {/* Month 1 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-[#8B6B47] mb-4">
        Månad 1: {timeline.month1?.focus}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Förväntade förbättringar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timeline.month1?.expectedImprovements?.map((improvement: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {improvement}
              </div>
            ))}
          </div>
        </div>
        
        {timeline.month1?.milestones && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Milstolpar</h4>
            <div className="flex flex-wrap gap-2">
              {timeline.month1.milestones.map((milestone: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-[#8B6B47]/10 text-[#8B6B47] rounded-full text-sm">
                  {milestone}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>

    {/* Month 3 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-[#8B6B47]/10 to-[#6B5337]/10 rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        3 månader: {timeline.month3?.focus}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Förväntade resultat</h4>
          <ul className="space-y-2">
            {timeline.month3?.expectedResults?.map((result: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <Star className="w-4 h-4 text-[#8B6B47] mt-0.5 flex-shrink-0" />
                {result}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-white/70 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Underhållsplan:</span> {timeline.month3?.maintenancePlan}
          </p>
        </div>
      </div>
    </motion.div>
  </div>
)

const LifestyleTab = ({ lifestyle }: { lifestyle: any }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {/* Sleep */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Moon className="w-5 h-5" />
        Sömn
      </h3>
      <p className="text-gray-700 mb-3">{lifestyle.sleep?.recommendation}</p>
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-sm text-blue-800">{lifestyle.sleep?.importance}</p>
      </div>
      <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
      <ul className="space-y-1">
        {lifestyle.sleep?.tips?.map((tip: string, i: number) => (
          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </motion.div>

    {/* Stress */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Stresshantering
      </h3>
      <p className="text-gray-700 mb-3">{lifestyle.stress?.currentImpact}</p>
      <h4 className="font-medium text-gray-900 mb-2">Tekniker:</h4>
      <ul className="space-y-2">
        {lifestyle.stress?.techniques?.map((technique: string, i: number) => (
          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            {technique}
          </li>
        ))}
      </ul>
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-800">
          <span className="font-medium">Daglig rutin:</span> {lifestyle.stress?.dailyPractice}
        </p>
      </div>
    </motion.div>

    {/* Exercise */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Dumbbell className="w-5 h-5" />
        Träning
      </h3>
      <p className="text-gray-700 mb-3">{lifestyle.exercise?.recommendation}</p>
      <p className="text-sm text-gray-600 mb-4">{lifestyle.exercise?.skinBenefits}</p>
      <h4 className="font-medium text-gray-900 mb-2">Bästa typerna:</h4>
      <div className="flex flex-wrap gap-2">
        {lifestyle.exercise?.bestTypes?.map((type: string, i: number) => (
          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {type}
          </span>
        ))}
      </div>
    </motion.div>

    {/* Environment */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-[#8B6B47] mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Miljö
      </h3>
      <p className="text-gray-700 mb-3">{lifestyle.environment?.protection}</p>
      <p className="text-sm text-gray-600 mb-4">{lifestyle.environment?.seasonalAdjustments}</p>
      <h4 className="font-medium text-gray-900 mb-2">Hemmatips:</h4>
      <ul className="space-y-1">
        {lifestyle.environment?.homeEnvironment?.map((tip: string, i: number) => (
          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
            <span className="text-[#8B6B47] mt-0.5">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </motion.div>
  </div>
)

const ProductsTab = ({ products }: { products: any }) => (
  <div className="space-y-6">
    {/* Essential Products */}
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Rekommenderade produkter</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {products.essentials?.map((product: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h4 className="text-lg font-semibold text-[#8B6B47] mb-2">{product.name}</h4>
            <p className="text-sm text-gray-700 mb-3">{product.why}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Användning</p>
                <p className="text-sm text-gray-700">{product.usage}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nyckelingredienser</p>
                <div className="flex flex-wrap gap-1">
                  {product.keyIngredients?.map((ingredient: string, j: number) => (
                    <span key={j} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Förväntat:</span> {product.expectedResults}
                </p>
              </div>
            </div>
            
            <Link
              href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="mt-4 inline-flex items-center gap-2 text-[#8B6B47] hover:text-[#6B5337] font-medium text-sm"
            >
              Se produkt
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Application Order */}
    <div className="bg-gradient-to-br from-[#8B6B47]/10 to-[#6B5337]/10 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appliceringsordning</h3>
      <div className="flex flex-wrap items-center gap-3">
        {products.applicationOrder?.map((step: string, i: number) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B6B47] text-white rounded-full flex items-center justify-center text-sm font-medium">
                {i + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
            {i < products.applicationOrder.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Pro Tips */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Pro-tips
      </h3>
      <ul className="space-y-2">
        {products.proTips?.map((tip: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-gray-700">
            <span className="text-[#8B6B47] font-semibold mt-0.5">{i + 1}.</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  </div>
)

const NutritionTab = ({ nutrition }: { nutrition: any }) => (
  <div className="space-y-6">
    {/* Gut-Skin Axis */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-green-600" />
        Gut-Skin Axis
      </h3>
      <p className="text-gray-700">{nutrition.gutSkinAxis}</p>
    </div>

    {/* Key Foods */}
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Nyckelföda för din hud</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {nutrition.keyFoods?.map((category: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-5 shadow-lg"
          >
            <h4 className="font-semibold text-[#8B6B47] mb-3">{category.category}</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {category.foods?.map((food: string, j: number) => (
                  <span key={j} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{category.benefit}</p>
              {category.servingSuggestion && (
                <p className="text-xs text-[#8B6B47] font-medium">
                  💡 {category.servingSuggestion}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Meal Plan */}
    {nutrition.mealPlan && (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-[#8B6B47]" />
          Exempel på dagsmeny
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Frukost</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {nutrition.mealPlan.breakfast}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Lunch</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {nutrition.mealPlan.lunch}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Middag</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {nutrition.mealPlan.dinner}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Mellanmål</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <ul className="text-sm text-gray-600 space-y-1">
                {Array.isArray(nutrition.mealPlan.snacks) ? 
                  nutrition.mealPlan.snacks.map((snack: string, i: number) => (
                    <li key={i}>• {snack}</li>
                  )) : 
                  <li>• {nutrition.mealPlan.snacks}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Hydration */}
    {nutrition.hydration && (
      <div className="bg-blue-50 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Hydrering
        </h3>
        <p className="text-gray-700 mb-3">
          <span className="font-medium">Dagligt mål:</span> {nutrition.hydration.dailyGoal}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Tips</h4>
            <ul className="space-y-1">
              {nutrition.hydration.tips?.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-gray-600">• {tip}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Örtteer</h4>
            <ul className="space-y-1">
              {nutrition.hydration.herbalteas?.map((tea: string, i: number) => (
                <li key={i} className="text-sm text-gray-600">• {tea}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}
  </div>
)

const SourcesTab = ({ sources }: { sources: any }) => (
  <div className="space-y-6">
    {/* Scientific Basis */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#8B6B47]" />
        Vetenskaplig grund
      </h3>
      <p className="text-gray-700">{sources.scientificBasis}</p>
    </div>

    {/* Key Studies */}
    {sources.keyStudies && sources.keyStudies.length > 0 && (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nyckelstudier</h3>
        <ul className="space-y-3">
          {sources.keyStudies.map((study: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#8B6B47] mt-0.5">•</span>
              <span className="text-gray-700 text-sm">{study}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Expert Note */}
    {sources.expertNote && (
      <div className="bg-gradient-to-br from-[#8B6B47]/10 to-[#6B5337]/10 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#8B6B47]" />
          Expertkommentar
        </h3>
        <p className="text-gray-700 italic">{sources.expertNote}</p>
      </div>
    )}

    {/* Additional Reading */}
    {sources.additionalReading && sources.additionalReading.length > 0 && (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fördjupande läsning</h3>
        <ul className="space-y-2">
          {sources.additionalReading.map((reading: string, i: number) => (
            <li key={i} className="text-gray-700 text-sm">
              • {reading}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
) 