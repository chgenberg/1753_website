'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Star, ShoppingCart, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { QuizResultsMockup } from './QuizResultsMockup'

interface QuizResultsProps {
  answers: { [key: string]: string | string[] }
  onRestart: () => void
  onClose: () => void
}

interface ProductRecommendation {
  id: string
  name: string
  image: string
  price: string
  description: string
  benefits: string[]
  match: number
}

interface PersonalizedResult {
  skinProfile: string
  recommendations: {
    products: string[]
    ingredients: string[]
    routine: string[]
  }
  explanation: string
  tips: string[]
}

export const QuizResults = ({ answers, onRestart, onClose }: QuizResultsProps) => {
  const [email, setEmail] = useState('')
  const [aiResults, setAiResults] = useState<PersonalizedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMockup, setShowMockup] = useState(false)

  // Fetch AI-generated results
  useEffect(() => {
    const fetchAIResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Transform answers to match API format
        const quizAnswers = {
          skinType: answers.skinType as string || '',
          concerns: Array.isArray(answers.concerns) ? answers.concerns : [answers.concerns as string].filter(Boolean),
          lifestyle: Array.isArray(answers.lifestyle) ? answers.lifestyle : [answers.lifestyle as string].filter(Boolean),
          currentProducts: Array.isArray(answers.currentProducts) ? answers.currentProducts : [answers.currentProducts as string].filter(Boolean),
          goals: Array.isArray(answers.goals) ? answers.goals : [answers.goals as string].filter(Boolean),
          age: answers.age as string || '',
          budget: answers.budget as string || ''
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizAnswers)
        })

        if (!response.ok) {
          throw new Error('Kunde inte hämta personaliserade resultat')
        }

        const data = await response.json()
        setAiResults(data.data)
      } catch (err) {
        console.error('Error fetching AI results:', err)
        setError(err instanceof Error ? err.message : 'Ett fel uppstod')
        setShowMockup(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAIResults()
  }, [answers])

  // Map product names to product data
  const getProductRecommendations = (productNames: string[]): ProductRecommendation[] => {
    const productMap: { [key: string]: ProductRecommendation } = {
      'THE ONE': {
        id: 'the-one',
        name: 'The ONE Facial Oil',
        image: '/images/products/TheONE.png',
        price: '649 kr',
        description: 'Vår bestseller med CBD och CBG för balanserad hud',
        benefits: ['Stärker hudbarriären', 'Återfuktar', 'Antioxidanter'],
        match: 95
      },
      'NATUREL': {
        id: 'naturel',
        name: 'Au Naturel Makeup Remover',
        image: '/images/products/Naturel.png',
        price: '399 kr',
        description: 'Mild makeupborttagare för känslig hud',
        benefits: ['Lugnar känslig hud', 'Hypoallergen', 'Skonsam rengöring'],
        match: 92
      },
      'TA-DA': {
        id: 'ta-da',
        name: 'TA-DA Serum',
        image: '/images/products/TA-DA.png',
        price: '699 kr',
        description: 'Kraftfullt serum för problematisk hud',
        benefits: ['Minskar inflammation', 'Balanserar oljeproduktion', 'Lugnar irriterad hud'],
        match: 90
      },
      'FUNGTASTIC': {
        id: 'fungtastic',
        name: 'Fungtastic Mushroom Extract',
        image: '/images/products/Fungtastic.png',
        price: '399 kr',
        description: 'Med medicinsvampar för anti-aging och fasthet',
        benefits: ['Stimulerar kollagenproduktion', 'Förbättrar elasticitet', 'Antioxidanter'],
        match: 88
      },
      'I LOVE': {
        id: 'i-love',
        name: 'I LOVE Facial Oil',
        image: '/images/products/ILOVE.png',
        price: '849 kr',
        description: 'Komplett ansiktsolja för alla hudtyper',
        benefits: ['Komplett hudvård', 'Rik på CBD och CBG', 'Djupt återfuktande'],
        match: 85
      },
      'DUO': {
        id: 'duo',
        name: 'DUO-kit',
        image: '/images/products/DUO.png',
        price: '1099 kr',
        description: 'Kombinationspaket för komplett hudvård',
        benefits: ['Två produkter', 'Perfekt kombination', 'Bästa värdet'],
        match: 87
      }
    }

    return productNames.map(name => productMap[name.toUpperCase()] || productMap['THE ONE'])
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email)
    // Show success message or redirect
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyserar dina svar...
          </h2>
          <p className="text-gray-600 text-center">
            Vår AI skapar personaliserade hudvårdsrekommendationer baserat på dina svar.
          </p>
        </div>
      </div>
    )
  }

  // Show mockup if API fails or is not available
  if (showMockup || (error && !aiResults)) {
    return (
      <div>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-4 mb-4"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-yellow-800 font-medium">Demo-läge aktiverat</p>
                <p className="text-yellow-700 text-sm">OpenAI API är inte tillgängligt just nu, så vi visar en mockup av resultaten.</p>
              </div>
            </div>
          </motion.div>
        )}
        <QuizResultsMockup answers={answers} />
      </div>
    )
  }

  if (!aiResults) return null

  const productRecommendations = getProductRecommendations(aiResults.recommendations.products)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500 mr-4" />
          <Sparkles className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Dina personliga resultat!
        </h2>
        <p className="text-lg text-gray-600">
          AI-genererade rekommendationer baserat på dina svar
        </p>
      </motion.div>

      {/* AI-Generated Skin Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {aiResults.skinProfile}
        </h3>
        <p className="text-gray-700 mb-4">{aiResults.explanation}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rekommenderade ingredienser:</h4>
            <ul className="space-y-1">
              {aiResults.recommendations.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Din hudvårdsrutin:</h4>
            <ol className="space-y-1">
              {aiResults.recommendations.routine.map((step, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>

      {/* AI Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-yellow-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
          <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
          Personliga tips för dig
        </h3>
        <ul className="space-y-2">
          {aiResults.tips.map((tip, index) => (
            <li key={index} className="text-gray-700 flex items-start">
              <ArrowRight className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Product Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Rekommenderade produkter för dig
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productRecommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.match}% match
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Fördelar:</h5>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Lägg till
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Email Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Få dina AI-resultat via email
        </h3>
        <p className="text-gray-600 mb-4">
          Vi skickar dig en sammanfattning av dina personaliserade resultat och hudvårdstips.
        </p>
        <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Din email-adress"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            Skicka resultat
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </form>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Gör om testet
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Stäng och fortsätt handla
        </button>
      </div>
    </div>
  )
} 