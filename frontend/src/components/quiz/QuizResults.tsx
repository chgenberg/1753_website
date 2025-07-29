'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Heart, Droplets, Leaf, Brain, MessageCircle, 
  CheckCircle, ArrowRight, ShoppingBag, Sun, Moon, 
  Award, Target, Users, Send, User, Loader, 
  Shield, Star, TrendingUp, Activity, Coffee,
  Smile, CloudRain, Wind, Dumbbell, Apple,
  Clock, BrainCircuit, Lightbulb, ChevronRight,
  Calendar, Zap, BookOpen, Utensils, Home, HelpCircle,
  X, Info, ShoppingCart, Plus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'

interface QuizResultsProps {
  answers: Record<string, string>
  userName?: string
  userEmail?: string
  results?: any
  onRestart?: () => void
  onClose?: () => void
}

type TabType = 'summary' | 'timeline' | 'lifestyle' | 'products' | 'nutrition' | 'sources'

// Product data with images
const productData = {
  'The ONE Facial Oil': {
    image: '/images/products/the-one.png',
    price: 549,
    slug: 'the-one-facial-oil'
  },
  'TA-DA Serum': {
    image: '/images/products/ta-da-serum.png',
    price: 549,
    slug: 'ta-da-serum'
  },
  'Fungtastic Mushroom Extract': {
    image: '/images/products/fungtastic.png',
    price: 399,
    slug: 'fungtastic-mushroom-extract'
  },
  'Au Naturel Makeup Remover': {
    image: '/images/products/au-naturel.png',
    price: 399,
    slug: 'au-naturel-makeup-remover'
  },
  'I LOVE Facial Oil': {
    image: '/images/products/i-love.png',
    price: 549,
    slug: 'i-love-facial-oil'
  }
}

// Summary tab component
const SummaryTab = ({ summary }: { summary: any }) => (
  <div className="space-y-4">
    {/* Greeting and Overview */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-xl font-semibold text-[#4A3428] mb-3">{summary.greeting}</h3>
      <p className="text-gray-700 leading-relaxed text-sm">{summary.overview}</p>
    </div>

    {/* Main Concerns */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#4A3428]" />
        Dina huvudbekymmer
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {summary.mainConcerns?.map((concern: string, index: number) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <CheckCircle className="w-4 h-4 text-[#4A3428] flex-shrink-0" />
            <span className="text-sm text-gray-700">{concern}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Skin Analysis */}
    <div className="bg-gradient-to-br from-[#4A3428]/5 to-[#4A3428]/10 rounded-xl p-4">
      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-[#4A3428]" />
        Din hudanalys
      </h4>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Hudtyp:</span>
          <p className="text-sm text-gray-600 mt-1">{summary.skinAnalysis?.skinType}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">ECS-status:</span>
          <p className="text-sm text-gray-600 mt-1">{summary.skinAnalysis?.ecsStatus}</p>
        </div>
        {summary.skinAnalysis?.microbiomeStatus && (
          <div>
            <span className="text-sm font-medium text-gray-700">Mikrobiom:</span>
            <p className="text-sm text-gray-600 mt-1">{summary.skinAnalysis?.microbiomeStatus}</p>
          </div>
        )}
      </div>
    </div>

    {/* Action Plan */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h4 className="text-base font-semibold text-gray-900 mb-3">Din handlingsplan</h4>
      <div className="space-y-2">
        {summary.actionPlan?.map((action: string, index: number) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-[#4A3428] mt-0.5">{index + 1}.</span>
            <span className="text-sm text-gray-700">{action}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Updated Products Tab with standard routine
const ProductsTab = ({ products, addToCart }: { products: any, addToCart: any }) => {
  const standardRoutine = {
    morning: [
      { product: 'The ONE Facial Oil', amount: '3-5 droppar', purpose: 'Balanserar och skyddar' },
      { product: 'TA-DA Serum', amount: '1-2 pumpar', purpose: 'Aktiverar ECS och ger fukt' },
      { product: 'Fungtastic Mushroom Extract', amount: '2 kapslar', purpose: 'Stärker från insidan' }
    ],
    evening: [
      { product: 'Au Naturel Makeup Remover', amount: 'Efter behov', purpose: 'Tar bort smuts och makeup' },
      { product: 'I LOVE Facial Oil', amount: '3-5 droppar', purpose: 'Reparerar och återuppbygger' },
      { product: 'TA-DA Serum', amount: '1-2 pumpar', purpose: 'Nattreparation' }
    ]
  }

  return (
    <div className="space-y-4">
      {/* Skincare Routine */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-[#4A3428] mb-4">Din hudvårdsrutin</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Morning Routine */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              Morgonrutin
            </h4>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                • Skölj ansiktet med kallt eller ljummet vatten
              </div>
              {standardRoutine.morning.map((step, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">{step.product}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {step.amount} - {step.purpose}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Routine */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-500" />
              Kvällsrutin
            </h4>
            <div className="space-y-2">
              {standardRoutine.evening.map((step, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">{step.product}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {step.amount} - {step.purpose}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Hydration Reminder */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            <span className="font-medium">Under dagen:</span> Drick minst 2,1 liter vatten under dina 11 första vakna timmar
          </p>
        </div>
      </div>

      {/* Product Recommendations */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-[#4A3428] mb-4">Rekommenderade produkter</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(productData).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <Link href={`/products/${data.slug}`}>
                <div className="aspect-square bg-white rounded-lg mb-3 p-4">
                  <Image
                    src={data.image}
                    alt={name}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              <h4 className="font-medium text-sm text-gray-900 mb-1">{name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4A3428]">{data.price} kr</span>
                <button
                  onClick={() => addToCart({
                    id: data.slug,
                    name,
                    price: data.price,
                    quantity: 1,
                    image: data.image
                  })}
                  className="p-2 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2418] transition-colors"
                  aria-label={`Lägg ${name} i varukorg`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why These Products */}
      {products.reasoning && (
        <div className="bg-gradient-to-br from-[#4A3428]/5 to-[#4A3428]/10 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-2">Varför dessa produkter?</h4>
          <p className="text-sm text-gray-700">{products.reasoning}</p>
        </div>
      )}
    </div>
  )
}

// Timeline tab component
const TimelineTab = ({ timeline }: { timeline: any }) => (
  <div className="space-y-4">
    {/* Week 1 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-[#4A3428] mb-3">
        Vecka 1: {timeline.week1?.focus}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
            <Sun className="w-4 h-4 text-yellow-500" />
            Morgonrutin
          </h4>
          <ul className="space-y-1">
            {timeline.week1?.morningRoutine?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-[#4A3428] mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
            <Moon className="w-4 h-4 text-blue-500" />
            Kvällsrutin
          </h4>
          <ul className="space-y-1">
            {timeline.week1?.eveningRoutine?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-[#4A3428] mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          <span className="font-medium">Förväntat:</span> {timeline.week1?.expectedChanges}
        </p>
      </div>
    </motion.div>

    {/* Month 1 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-[#4A3428] mb-3">
        Månad 1: {timeline.month1?.focus}
      </h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Förväntade förbättringar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {timeline.month1?.expectedImprovements?.map((improvement: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                {improvement}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    {/* Month 3 */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-[#4A3428]/5 to-[#4A3428]/10 rounded-xl p-4"
    >
      <h3 className="text-lg font-semibold text-[#4A3428] mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" />
        3 månader: {timeline.month3?.focus}
      </h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Förväntade resultat</h4>
          <ul className="space-y-1">
            {timeline.month3?.expectedResults?.map((result: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <Star className="w-3 h-3 text-[#4A3428] mt-0.5 flex-shrink-0" />
                {result}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  </div>
)

// Lifestyle tab component
const LifestyleTab = ({ lifestyle }: { lifestyle: any }) => (
  <div className="space-y-4">
    {lifestyle.categories?.map((category: any, index: number) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl p-4 shadow-sm"
      >
        <h3 className="text-base font-semibold text-[#4A3428] mb-3 flex items-center gap-2">
          {category.icon === 'Sleep' && <Moon className="w-4 h-4" />}
          {category.icon === 'Exercise' && <Dumbbell className="w-4 h-4" />}
          {category.icon === 'Stress' && <Brain className="w-4 h-4" />}
          {category.icon === 'Nutrition' && <Apple className="w-4 h-4" />}
          {category.category}
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{category.impact}</p>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Rekommendationer</h4>
            <ul className="space-y-1">
              {category.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)

// Nutrition tab component
const NutritionTab = ({ nutrition }: { nutrition: any }) => (
  <div className="space-y-4">
    {/* Gut-Skin Axis */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-600" />
        Gut-Skin Axis
      </h3>
      <p className="text-sm text-gray-700">{nutrition.gutSkinAxis}</p>
    </div>

    {/* Key Foods */}
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3">Nyckelföda för din hud</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {nutrition.keyFoods?.map((category: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg p-3 shadow-sm"
          >
            <h4 className="font-semibold text-[#4A3428] mb-2 text-sm">{category.category}</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {category.foods?.map((food: string, j: number) => (
                  <span key={j} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {food}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600">{category.benefit}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)

// Sources tab component
const SourcesTab = ({ sources }: { sources: any }) => (
  <div className="space-y-4">
    {/* Methodology */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Vår metodik</h3>
      <p className="text-sm text-gray-700">{sources.methodology}</p>
    </div>

    {/* Scientific Foundation */}
    {sources.scientificFoundation && sources.scientificFoundation.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Vetenskaplig grund</h3>
        <ul className="space-y-2">
          {sources.scientificFoundation.map((source: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#4A3428] mt-0.5">•</span>
              <span className="text-sm text-gray-700">{source}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

export default function QuizResults({ 
  answers, 
  userName, 
  userEmail, 
  results, 
  onRestart,
  onClose 
}: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skinScore, setSkinScore] = useState(0)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showScoreExplanation, setShowScoreExplanation] = useState(false)
  const { addToCart, setUserEmail, setUserName } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  
     // Quiz data (keeping this for register modal)
   const quizData = {
     answers,
     results,
     userName: userName || '',
     userEmail: userEmail || ''
   }

  // Set user info in cart context for abandoned cart tracking
  useEffect(() => {
    if (userEmail) {
      setUserEmail(userEmail)
    }
    if (userName) {
      setUserName(userName)
    }
  }, [userEmail, userName, setUserEmail, setUserName])

  const tabs = [
    { id: 'summary' as TabType, label: 'Översikt', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'timeline' as TabType, label: 'Tidslinje', icon: <Calendar className="w-4 h-4" /> },
    { id: 'lifestyle' as TabType, label: 'Livsstil', icon: <Heart className="w-4 h-4" /> },
    { id: 'products' as TabType, label: 'Produkter', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'nutrition' as TabType, label: 'Kost', icon: <Apple className="w-4 h-4" /> },
    { id: 'sources' as TabType, label: 'Källor', icon: <BookOpen className="w-4 h-4" /> },
  ]

  // Generate personalized plan if results not provided
  useEffect(() => {
    const generatePlan = async () => {
      if (!results) {
        setIsGeneratingPlan(true)
        try {
          const response = await fetch('/api/quiz/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              answers, 
              userName: userName || 'Användare',
              userEmail: userEmail || ''
            })
          })
          
          if (!response.ok) throw new Error('Failed to generate results')
          
          const data = await response.json()
          results = data
          
          // Animate skin score
          const targetScore = data.skinScore || 70
          let currentScore = 0
          const increment = targetScore / 30
          
          const scoreInterval = setInterval(() => {
            currentScore += increment
            if (currentScore >= targetScore) {
              currentScore = targetScore
              clearInterval(scoreInterval)
            }
            setSkinScore(Math.round(currentScore))
          }, 50)
          
        } catch (err) {
          console.error('Error generating results:', err)
          setError('Kunde inte generera din hudvårdsplan. Försök igen.')
        } finally {
          setIsGeneratingPlan(false)
          setIsLoading(false)
        }
      } else {
        // If results are provided, just animate the score
        const targetScore = results.skinScore || 70
        let currentScore = 0
        const increment = targetScore / 30
        
        const scoreInterval = setInterval(() => {
          currentScore += increment
          if (currentScore >= targetScore) {
            currentScore = targetScore
            clearInterval(scoreInterval)
          }
          setSkinScore(Math.round(currentScore))
        }, 50)
        
        setIsLoading(false)
      }
    }

    generatePlan()
  }, [answers, userName, userEmail, results])

  // Add to cart function
     const handleAddToCart = (product: any) => {
     addToCart({
       ...product,
       tags: [],
       images: [{ url: product.image, alt: product.name, position: 0 }],
       variants: [],
       inventory: 100,
       trackInventory: false,
       allowBackorder: true,
       isActive: true,
       isFeatured: product.featured || false,
       seoKeywords: [],
       keyIngredients: [],
       skinConcerns: [],
       timeOfDay: undefined,
       benefitsDetails: [],
       ingredientsDetails: [],
       imagesData: [],
       rating: { average: 0, count: 0 },
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
     })
   }

  if (isGeneratingPlan) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-[#4A3428] to-[#3A2418] rounded-full mx-auto mb-6 flex items-center justify-center"
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Compact Header with Score */}
        <div className="bg-white shadow-sm sticky top-20 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Score and Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#4A3428"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: skinScore / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        strokeDasharray: `${2 * Math.PI * 35}`,
                        strokeDashoffset: `${2 * Math.PI * 35 * (1 - skinScore / 100)}`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#4A3428]">{skinScore}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">HUDPOÄNG</span>
                  </div>
                  <button
                    onClick={() => setShowScoreExplanation(true)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DIN PERSONLIGA HUDVÅRDSPLAN</h1>
                  <p className="text-sm text-gray-600">Baserad på din unika hudprofil och livsstil</p>
                </div>
              </div>

              {/* Email Signup */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Vill du ha din plan på mail?</p>
                  <p className="text-xs text-gray-600">Få påminnelser och uppföljning</p>
                </div>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2418] transition-colors flex items-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Skicka till mail
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#4A3428] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'summary' && results?.summary && <SummaryTab summary={results.summary} />}
              {activeTab === 'timeline' && results?.timeline && <TimelineTab timeline={results.timeline} />}
              {activeTab === 'lifestyle' && results?.lifestyle && <LifestyleTab lifestyle={results.lifestyle} />}
              {activeTab === 'products' && results?.products && <ProductsTab products={results.products} addToCart={handleAddToCart} />}
              {activeTab === 'nutrition' && results?.nutrition && <NutritionTab nutrition={results.nutrition} />}
              {activeTab === 'sources' && results?.sources && <SourcesTab sources={results.sources} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Score Explanation Modal */}
        <AnimatePresence>
          {showScoreExplanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowScoreExplanation(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vad betyder hudpoängen?</h3>
                  <button
                    onClick={() => setShowScoreExplanation(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">90-100: Utmärkt</div>
                    <div className="text-sm text-green-700">Din hud är i toppskick!</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">70-89: Bra</div>
                    <div className="text-sm text-blue-700">Din hud mår bra med mindre förbättringar</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900">50-69: Genomsnitt</div>
                    <div className="text-sm text-yellow-700">Det finns utrymme för förbättring</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-900">Under 50: Behöver omsorg</div>
                    <div className="text-sm text-red-700">Din hud behöver extra uppmärksamhet</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-4">
                  Poängen baseras på din hudtyp, livsstil, nuvarande hudproblem och miljöfaktorer. 
                  Följ din personliga plan för att förbättra din poäng över tid!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Register Modal */}
        <AnimatePresence>
          {showRegisterModal && (
            <RegisterModal
              isOpen={showRegisterModal}
              onClose={() => setShowRegisterModal(false)}
              quizData={quizData}
            />
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  )
}