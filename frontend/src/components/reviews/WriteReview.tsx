'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, X } from 'lucide-react'

interface WriteReviewProps {
  productId: string
  productName: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function WriteReview({ productId, productName, isOpen, onClose, onSubmit }: WriteReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerEmail, setReviewerEmail] = useState('')
  const [reviewerLocation, setReviewerLocation] = useState('')
  const [skinType, setSkinType] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [usageDuration, setUsageDuration] = useState('')
  const [skinConcerns, setSkinConcerns] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const skinTypes = ['Torr', 'Oljig', 'Kombinerad', 'Känslig', 'Normal', 'Aknebenägen', 'Mogen']
  const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
  const usageDurations = ['Mindre än 1 månad', '1-3 månader', '3-6 månader', '6-12 månader', 'Mer än 1 år']
  const skinConcernOptions = ['Akne', 'Rynkor', 'Pigmentfläckar', 'Torrhet', 'Oljighet', 'Känslig hud', 'Stora porer', 'Ojämn hudton']

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) newErrors.rating = 'Välj ett betyg'
    if (!title.trim()) newErrors.title = 'Titel krävs'
    if (!body.trim() || body.length < 10) newErrors.body = 'Recensionen måste vara minst 10 tecken'
    if (!reviewerName.trim()) newErrors.reviewerName = 'Namn krävs'
    if (!reviewerEmail.trim()) newErrors.reviewerEmail = 'E-post krävs'
    if (reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
      newErrors.reviewerEmail = 'Ogiltig e-postadress'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          title,
          body,
          reviewerName,
          reviewerEmail,
          reviewerLocation: reviewerLocation || undefined,
          skinType: skinType || undefined,
          ageRange: ageRange || undefined,
          usageDuration: usageDuration || undefined,
          skinConcerns: skinConcerns.length > 0 ? skinConcerns : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Något gick fel')
      }

      // Reset form
      setRating(0)
      setTitle('')
      setBody('')
      setReviewerName('')
      setReviewerEmail('')
      setReviewerLocation('')
      setSkinType('')
      setAgeRange('')
      setUsageDuration('')
      setSkinConcerns([])
      setErrors({})

      onSubmit()
      onClose()
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSkinConcern = (concern: string) => {
    setSkinConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Skriv en recension för {productName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Betyg *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                placeholder="Sammanfatta din upplevelse"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recensionstext *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                placeholder="Berätta om din upplevelse med produkten..."
                maxLength={2000}
              />
              <div className="text-sm text-gray-500 mt-1">{body.length}/2000 tecken</div>
              {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Namn *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                  placeholder="Ditt namn"
                />
                {errors.reviewerName && <p className="text-red-500 text-sm mt-1">{errors.reviewerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post *
                </label>
                <input
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                  placeholder="din@email.com"
                />
                {errors.reviewerEmail && <p className="text-red-500 text-sm mt-1">{errors.reviewerEmail}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plats (valfritt)
              </label>
              <input
                type="text"
                value={reviewerLocation}
                onChange={(e) => setReviewerLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                placeholder="Stockholm, Sverige"
              />
            </div>

            {/* Skin Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Hudinfo (valfritt)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hudtyp
                  </label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                  >
                    <option value="">Välj hudtyp</option>
                    {skinTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ålder
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                  >
                    <option value="">Välj åldersgrupp</option>
                    {ageRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Användningstid
                  </label>
                  <select
                    value={usageDuration}
                    onChange={(e) => setUsageDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent"
                  >
                    <option value="">Välj användningstid</option>
                    {usageDurations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hudproblem (välj flera)
                </label>
                <div className="flex flex-wrap gap-2">
                  {skinConcernOptions.map(concern => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleSkinConcern(concern)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        skinConcerns.includes(concern)
                          ? 'bg-[#8B6B47] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#8B6B47] text-white rounded-lg hover:bg-[#6B5337] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Skicka recension
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 