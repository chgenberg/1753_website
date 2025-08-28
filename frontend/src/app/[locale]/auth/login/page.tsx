'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (!success) {
        setError('Fel e-postadress eller lösenord')
        return
      }

      // Determine locale from current path
      const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'sv') || 'sv'

      // Read user role from stored userData
      let role: string | undefined
      try {
        const userJson = typeof window !== 'undefined' ? localStorage.getItem('userData') : null
        if (userJson) {
          const parsed = JSON.parse(userJson)
          role = parsed?.role
        }
      } catch {}

      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.push(`/${locale}/admin`)
      } else {
        router.push(`/${locale}/dashboard`)
      }
    } catch (err) {
      setError('Fel e-postadress eller lösenord')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/Cannabis/CBG.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-gradient-to-br from-[#8B6B47] to-[#6B5337] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-light text-gray-900 uppercase tracking-wider">
                Välkommen tillbaka
              </h1>
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B6B47] focus:bg-white transition-all"
                  placeholder="din@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lösenord
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B6B47] focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#8B6B47] focus:ring-[#8B6B47] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Kom ihåg mig</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#8B6B47] hover:text-[#6B5337] transition-colors">
                Glömt lösenord?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#FCB237] hover:bg-[#3A2A1E] text-white rounded-xl font-medium transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loggar in...' : 'Logga in'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/95 text-gray-500">eller</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Har du inget konto?{' '}
              <Link href="/auth/register" className="text-[#8B6B47] hover:text-[#6B5337] font-medium transition-colors">
                Skapa konto
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tillbaka till startsidan
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 