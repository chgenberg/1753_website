'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Välkommen tillbaka!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Fel e-post eller lösenord')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAF8] to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center text-[#6B5D54] hover:text-[#4A3428] mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#F0EDE8] p-8 md:p-12">
          <h1 className="text-3xl font-light text-[#4A3428] mb-2">Välkommen tillbaka</h1>
          <p className="text-[#6B5D54] mb-8">Logga in på ditt konto</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="din@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                Lösenord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4A3428]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#8B7355] hover:text-[#4A3428] transition-colors"
              >
                Glömt lösenord?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#8B7355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loggar in...' : 'Logga in'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#6B5D54]">
              Har du inget konto?{' '}
              <Link
                href="/auth/register"
                className="text-[#8B7355] hover:text-[#4A3428] font-medium transition-colors"
              >
                Skapa konto
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 