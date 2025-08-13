'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  Check, 
  AlertCircle, 
  Loader2,
  Heart,
  Sparkles,
  Gift
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NewsletterFormData {
  email: string
  firstName: string
  skinType: string
  interests: string[]
}

interface NewsletterSectionProps {
  variant?: 'default' | 'minimal' | 'blog'
  className?: string
}

const skinTypes = [
  { value: 'dry', label: 'Torr hud' },
  { value: 'oily', label: 'Fet hud' },
  { value: 'combination', label: 'Kombinationshud' },
  { value: 'sensitive', label: 'Känslig hud' },
  { value: 'normal', label: 'Normal hud' },
  { value: 'acne', label: 'Aknebenägen hud' },
  { value: 'mature', label: 'Mogen hud' }
]

const interests = [
  { value: 'skincare_tips', label: '🌿 Hudvårdstips' },
  { value: 'product_launches', label: '✨ Nya produkter' },
  { value: 'exclusive_offers', label: '🎁 Exklusiva erbjudanden' },
  { value: 'ingredient_education', label: '🧪 Ingredienslära' },
  { value: 'routine_advice', label: '💆‍♀️ Rutinråd' }
]

export default function NewsletterSection({ 
  variant = 'default', 
  className = '' 
}: NewsletterSectionProps) {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    firstName: '',
    skinType: '',
    interests: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showExtended, setShowExtended] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      toast.error('E-postadress krävs')
      return
    }

    setIsSubmitting(true)

    try {
      // Subscribe to Drip
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          tags: ['newsletter', 'website-signup'],
          source: 'newsletter-section',
          workflow: 'nyhetsbrev'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        toast.success(data.message)
        
        // Reset form after success
        setTimeout(() => {
          setFormData({ email: '', firstName: '', skinType: '', interests: [] })
          setIsSuccess(false)
          setShowExtended(false)
        }, 3000)
      } else {
        toast.error(data.message || 'Något gick fel')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Tekniskt fel. Försök igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={`bg-gradient-to-r from-[#F5F3F0] to-blue-50 rounded-2xl p-6 ${className}`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E5DDD5] rounded-full mb-4">
            <Mail className="w-6 h-6 text-[#FCB237]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Få våra senaste nyheter</h3>
          <p className="text-gray-600">
            Exklusiva erbjudanden och hudvårdstips direkt till din inbox
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E5DDD5] rounded-full mb-4">
              <Check className="w-8 h-8 text-[#FCB237]" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tack!</h4>
            <p className="text-gray-600">Vi skickar snart vårt välkomstmail till dig.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Din e-postadress"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#FCB237] text-white rounded-lg font-semibold hover:bg-[#3A2A1E] transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Prenumerera
                </>
              )}
            </motion.button>
          </form>
        )}
      </div>
    )
  }

  return (
    <section className={`py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
            <Sparkles className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bli en del av vår hudvårdsfamilj
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Få personliga hudvårdstips, exklusiva erbjudanden och var först med att prova våra nya produkter.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <Gift className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">20% välkomstrabatt</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <span className="text-sm font-medium">Personliga tips</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <Sparkles className="w-5 h-5 text-[#F5F3F0]0 mr-2" />
              <span className="text-sm font-medium">Exklusiva produkter</span>
            </div>
          </div>
        </motion.div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E5DDD5] rounded-full mb-6">
              <Check className="w-10 h-10 text-[#FCB237]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Välkommen till familjen! 🎉</h3>
            <p className="text-gray-600 mb-6">
              Tack {formData.firstName || 'för din prenumeration'}! Vi skickar snart ditt välkomstmail med en exklusiv rabattkod.
            </p>
            <div className="bg-[#F5F3F0] rounded-xl p-4">
              <p className="text-[#2A1A14] font-medium">
                Kolla din inkorg inom några minuter för din 20% välkomstrabatt!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-postadress *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                      placeholder="din@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Förnamn (valfritt)
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Ditt förnamn"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {!showExtended && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowExtended(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Anpassa dina preferenser för bättre innehåll →
                  </button>
                </div>
              )}

              {showExtended && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 border-t pt-6"
                >
                  <div>
                    <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-2">
                      Min hudtyp
                    </label>
                    <select
                      id="skinType"
                      name="skinType"
                      value={formData.skinType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                      disabled={isSubmitting}
                    >
                      <option value="">Välj din hudtyp</option>
                      {skinTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vad är du intresserad av? (välj flera)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {interests.map(interest => (
                        <label key={interest.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest.value)}
                            onChange={() => handleInterestToggle(interest.value)}
                            className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            disabled={isSubmitting}
                          />
                          <span className="text-sm text-gray-700">{interest.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-brand text-white rounded-lg font-semibold hover:bg-brand-hover transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6 mr-2" />
                    Gå med nu och få 20% rabatt!
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center">
                Genom att prenumerera godkänner du våra{' '}
                <a href="/privacy" className="text-brand hover:underline">
                  villkor
                </a>{' '}
                och{' '}
                <a href="/privacy" className="text-brand hover:underline">
                  integritetspolicy
                </a>
                . Du kan avregistrera dig när som helst.
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  )
} 