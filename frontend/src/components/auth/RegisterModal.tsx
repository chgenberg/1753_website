'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Lock, Eye, EyeOff, Sparkles, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  quizData?: {
    answers: any
    results: any
    userName: string
    userEmail: string
  }
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, quizData }) => {
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: quizData?.userName || '',
    lastName: '',
    email: quizData?.userEmail || '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    newsletter: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Förnamn krävs'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Efternamn krävs'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-post krävs'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ogiltig e-postadress'
    }

    if (!formData.password) {
      newErrors.password = 'Lösenord krävs'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Lösenord måste vara minst 8 tecken'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lösenorden matchar inte'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Du måste acceptera användarvillkoren'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        skinType: quizData?.results?.skinType,
        skinConcerns: quizData?.results?.concerns || [],
        newsletter: formData.newsletter,
        quizAnswers: quizData?.answers
      }

      const success = await register(registrationData)

      if (success) {
        toast.success('Välkommen! Ditt konto har skapats framgångsrikt!')
        onClose()
      } else {
        toast.error('Något gick fel vid registreringen. Försök igen.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Ett tekniskt fel uppstod. Försök igen senare.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-100">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Skapa Ditt Kostnadsfria Konto
                  </h2>
                  <p className="text-gray-600">
                    Få tillgång till din personliga hudresa och exklusiva fördelar
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Förnamn *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                          errors.firstName ? 'border-red-400' : 'border-gray-300'
                        }`}
                        placeholder="Anna"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Efternamn *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                        errors.lastName ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Andersson"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-postadress *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                        errors.email ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="anna@exempel.se"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lösenord *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                        errors.password ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Minst 8 tecken"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bekräfta lösenord *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                        errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Upprepa lösenordet"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefonnummer (valfritt)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                    placeholder="070-123 45 67"
                  />
                </div>

                {/* Terms & Newsletter */}
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        Jag accepterar{' '}
                        <a href="/villkor" target="_blank" className="text-amber-600 hover:underline">
                          användarvillkoren
                        </a>{' '}
                        och{' '}
                        <a href="/integritetspolicy" target="_blank" className="text-amber-600 hover:underline">
                          integritetspolicyn
                        </a>
                      </span>
                      {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Jag vill få nyhetsbrev med hudvårdstips och exklusiva erbjudanden
                    </span>
                  </label>
                </div>

                {/* Benefits */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Med ditt konto får du:</h4>
                  <ul className="space-y-1">
                    {[
                      'Personlig hudresa med progress tracking',
                      'Exklusiva hudvårdstips och rutiner',
                      'Tidig tillgång till nya produkter',
                      'Personaliserade produktrekommendationer'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Skapar konto...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Skapa Mitt Konto
                    </>
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600">
                  Har du redan ett konto?{' '}
                  <button
                    type="button"
                    className="text-amber-600 hover:underline font-medium"
                    onClick={() => {
                      // TODO: Open login modal
                      console.log('Open login modal')
                    }}
                  >
                    Logga in
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 