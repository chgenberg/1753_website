'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Star, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react'

interface QuizResultsProps {
  answers: { [key: string]: string }
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

export const QuizResults = ({ answers, onRestart, onClose }: QuizResultsProps) => {
  const [email, setEmail] = useState('')

  // Analyze answers to determine skin profile
  const analyzeSkinProfile = () => {
    const concerns = answers.concerns?.split(',') || []
    const skinType = answers.skinType || ''
    const age = answers.age || ''
    
    let profile = ''
    let recommendations: ProductRecommendation[] = []
    
    if (concerns.includes('acne') || concerns.includes('inflammation')) {
      profile = 'Problematisk hud'
      recommendations = [
        {
          id: 'ta-da',
          name: 'TA-DA',
          image: '/images/products/TA-DA.png',
          price: '899 kr',
          description: 'Perfekt för problematisk hud med anti-inflammatoriska egenskaper',
          benefits: ['Minskar inflammation', 'Balanserar oljeproduktion', 'Lugnar irriterad hud'],
          match: 95
        },
        {
          id: 'the-one',
          name: 'THE ONE',
          image: '/images/products/TheONE.png',
          price: '799 kr',
          description: 'Vår bestseller med CBD och CBG för balanserad hud',
          benefits: ['Stärker hudbarriären', 'Återfuktar', 'Antioxidanter'],
          match: 85
        }
      ]
    } else if (skinType === 'sensitive' || concerns.includes('sensitivity')) {
      profile = 'Känslig hud'
      recommendations = [
        {
          id: 'naturel',
          name: 'NATUREL',
          image: '/images/products/Naturel.png',
          price: '749 kr',
          description: 'Mild formula speciellt utvecklad för känslig hud',
          benefits: ['Lugnar känslig hud', 'Hypoallergen', 'Stärker hudbarriären'],
          match: 92
        },
        {
          id: 'the-one',
          name: 'THE ONE',
          image: '/images/products/TheONE.png',
          price: '799 kr',
          description: 'Vår bestseller med CBD och CBG för balanserad hud',
          benefits: ['Stärker hudbarriären', 'Återfuktar', 'Antioxidanter'],
          match: 80
        }
      ]
    } else if (concerns.includes('aging') || concerns.includes('firmness')) {
      profile = 'Anti-age fokus'
      recommendations = [
        {
          id: 'fungtastic',
          name: 'FUNGTASTIC',
          image: '/images/products/Fungtastic.png',
          price: '949 kr',
          description: 'Med medicinsvampar för anti-aging och fasthet',
          benefits: ['Stimulerar kollagenproduktion', 'Förbättrar elasticitet', 'Antioxidanter'],
          match: 90
        },
        {
          id: 'the-one',
          name: 'THE ONE',
          image: '/images/products/TheONE.png',
          price: '799 kr',
          description: 'Vår bestseller med CBD och CBG för balanserad hud',
          benefits: ['Stärker hudbarriären', 'Återfuktar', 'Antioxidanter'],
          match: 85
        }
      ]
    } else {
      profile = 'Allmän hudvård'
      recommendations = [
        {
          id: 'the-one',
          name: 'THE ONE',
          image: '/images/products/TheONE.png',
          price: '799 kr',
          description: 'Vår bestseller med CBD och CBG för balanserad hud',
          benefits: ['Stärker hudbarriären', 'Återfuktar', 'Antioxidanter'],
          match: 88
        },
        {
          id: 'i-love',
          name: 'I LOVE',
          image: '/images/products/ILOVE.png',
          price: '1299 kr',
          description: 'Komplett hudvårdskit för daglig rutin',
          benefits: ['Komplett rutin', 'Dag och natt', 'Perfekt start'],
          match: 82
        }
      ]
    }
    
    return { profile, recommendations }
  }

  const { profile, recommendations } = analyzeSkinProfile()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email)
    // Show success message or redirect
  }

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
          Baserat på dina svar har vi identifierat din hudprofil
        </p>
      </motion.div>

      {/* Skin Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Din hudprofil: {profile}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Dina svar:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Hudtyp: {answers.skinType || 'Ej specificerad'}</li>
              <li>• Ålder: {answers.age || 'Ej specificerad'}</li>
              <li>• Huvudsakliga bekymmer: {answers.concerns || 'Inga specifika'}</li>
              <li>• Nuvarande rutin: {answers.routine || 'Ej specificerad'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Våra rekommendationer:</h4>
            <p className="text-sm text-gray-600">
              Vi har valt produkter som specifikt passar din hudprofil och dina behov. 
              Våra CBD- och CBG-baserade produkter arbetar med din hud naturligt.
            </p>
          </div>
        </div>
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
          {recommendations.map((product, index) => (
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
          Få dina resultat via email
        </h3>
        <p className="text-gray-600 mb-4">
          Vi skickar dig en sammanfattning av dina resultat och personliga hudvårdstips.
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